import { StoredReport } from "./pipeline/types";

// Storage-Adapter:
// - Mit DATABASE_URL (Supabase/Neon/Vercel Postgres): Postgres, eine Tabelle.
// - Ohne: Dateisystem unter .data/ (nur lokal/Dev).

const usePg = !!process.env.DATABASE_URL;

// ---------- Postgres ----------
import type { Pool as PgPool } from "pg";
let pool: PgPool | null = null;
let pgReady: Promise<void> | null = null;

async function getPool(): Promise<PgPool> {
  if (!pool) {
    const { Pool } = await import("pg");
    pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 3 });
    pgReady = pool.query(`
      CREATE TABLE IF NOT EXISTS reports (
        id TEXT PRIMARY KEY,
        status TEXT NOT NULL,
        paid BOOLEAN NOT NULL DEFAULT FALSE,
        email TEXT,
        data JSONB NOT NULL,
        raw_reviews JSONB,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `).then(() => undefined);
  }
  await pgReady;
  return pool;
}

// ---------- Dateisystem (Dev) ----------
import { promises as fs } from "fs";
import path from "path";
const DATA_DIR = path.join(process.cwd(), ".data", "reports");

async function fsSave(r: StoredReport) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(path.join(DATA_DIR, `${r.id}.json`), JSON.stringify(r));
}
async function fsGet(id: string): Promise<StoredReport | null> {
  try {
    if (!/^[a-zA-Z0-9_-]+$/.test(id)) return null;
    const raw = await fs.readFile(path.join(DATA_DIR, `${id}.json`), "utf8");
    return JSON.parse(raw) as StoredReport;
  } catch {
    return null;
  }
}

// ---------- Öffentliche API ----------
export async function saveReport(r: StoredReport): Promise<void> {
  if (!usePg) return fsSave(r);
  const p = await getPool();
  await p.query(
    `INSERT INTO reports (id, status, paid, email, data, raw_reviews, created_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7)
     ON CONFLICT (id) DO UPDATE SET status=$2, paid=$3, email=$4, data=$5, raw_reviews=$6`,
    [r.id, r.status, r.paid, r.email ?? null, JSON.stringify(r.data), r.rawReviews ? JSON.stringify(r.rawReviews) : null, r.createdAt]
  );
}

export async function getReport(id: string): Promise<StoredReport | null> {
  if (!usePg) return fsGet(id);
  const p = await getPool();
  const res = await p.query(`SELECT * FROM reports WHERE id = $1`, [id]);
  if (res.rows.length === 0) return null;
  const row = res.rows[0];
  return {
    id: row.id,
    status: row.status,
    paid: row.paid,
    email: row.email ?? undefined,
    data: row.data,
    rawReviews: row.raw_reviews ?? undefined,
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
  };
}

export async function markPaid(id: string): Promise<void> {
  const r = await getReport(id);
  if (!r) return;
  r.paid = true;
  await saveReport(r);
}
