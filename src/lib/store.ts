import { Konto, StoredReport } from "./pipeline/types";

// Storage-Adapter:
// - Mit DATABASE_URL (Supabase/Neon/Vercel Postgres): Postgres.
// - Ohne: Dateisystem unter .data/ (nur lokal/Dev).
//
// Drei Dinge liegen hier: Reports, Konten und Login-Token. Konten entstehen mit
// der Zahlung, Token sind kurzlebige Einmal-Schlüssel für die Anmeldung ohne
// Passwort.

const usePg = !!process.env.DATABASE_URL;

// ---------- Postgres ----------
import type { Pool as PgPool } from "pg";
let pool: PgPool | null = null;
let pgReady: Promise<void> | null = null;

async function getPool(): Promise<PgPool> {
  if (!pool) {
    const { Pool } = await import("pg");
    pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 3 });
    pgReady = pool
      .query(`
        CREATE TABLE IF NOT EXISTS reports (
          id TEXT PRIMARY KEY,
          status TEXT NOT NULL,
          paid BOOLEAN NOT NULL DEFAULT FALSE,
          email TEXT,
          data JSONB NOT NULL,
          raw_reviews JSONB,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
        ALTER TABLE reports ADD COLUMN IF NOT EXISTS owner_email TEXT;
        ALTER TABLE reports ADD COLUMN IF NOT EXISTS stripe_session_id TEXT;
        ALTER TABLE reports ADD COLUMN IF NOT EXISTS refunded BOOLEAN NOT NULL DEFAULT FALSE;
        ALTER TABLE reports ADD COLUMN IF NOT EXISTS ki_anteil REAL;
        ALTER TABLE reports ADD COLUMN IF NOT EXISTS fortschritt JSONB;
        ALTER TABLE reports ADD COLUMN IF NOT EXISTS zitate_geloescht_am TIMESTAMPTZ;
        CREATE INDEX IF NOT EXISTS reports_owner_idx ON reports (owner_email);
        CREATE INDEX IF NOT EXISTS reports_status_idx ON reports (status);

        CREATE TABLE IF NOT EXISTS konten (
          email TEXT PRIMARY KEY,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS login_token (
          token TEXT PRIMARY KEY,
          email TEXT NOT NULL,
          expires_at TIMESTAMPTZ NOT NULL,
          used BOOLEAN NOT NULL DEFAULT FALSE
        );

        -- Nachweis der Werbe-Einwilligung. angefragt_am = Checkbox gesetzt,
        -- bestaetigt_am = Link in der Mail geklickt. Erst dann darf geworben
        -- werden. widerrufen_am schliesst das wieder.
        CREATE TABLE IF NOT EXISTS einwilligungen (
          email TEXT PRIMARY KEY,
          token TEXT NOT NULL,
          quelle TEXT,
          angefragt_am TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          bestaetigt_am TIMESTAMPTZ,
          widerrufen_am TIMESTAMPTZ
        );
        CREATE INDEX IF NOT EXISTS einwilligungen_token_idx ON einwilligungen (token);
      `)
      .then(() => undefined);
  }
  await pgReady;
  return pool;
}

// ---------- Dateisystem (Dev) ----------
import { promises as fs } from "fs";
import path from "path";
const DATA_DIR = path.join(process.cwd(), ".data");
const REPORT_DIR = path.join(DATA_DIR, "reports");
const KONTO_DIR = path.join(DATA_DIR, "konten");
const TOKEN_DIR = path.join(DATA_DIR, "token");
const EINWILLIGUNG_DIR = path.join(DATA_DIR, "einwilligungen");

const sicher = (s: string) => /^[a-zA-Z0-9_-]+$/.test(s);
const emailDatei = (email: string) => Buffer.from(email.toLowerCase()).toString("hex");

async function fsSchreiben(dir: string, name: string, wert: unknown) {
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, `${name}.json`), JSON.stringify(wert));
}
async function fsLesen<T>(dir: string, name: string): Promise<T | null> {
  try {
    return JSON.parse(await fs.readFile(path.join(dir, `${name}.json`), "utf8")) as T;
  } catch {
    return null;
  }
}
async function fsAlle<T>(dir: string): Promise<T[]> {
  try {
    const namen = await fs.readdir(dir);
    const out: T[] = [];
    for (const n of namen) {
      if (!n.endsWith(".json")) continue;
      const w = await fsLesen<T>(dir, n.slice(0, -5));
      if (w) out.push(w);
    }
    return out;
  } catch {
    return [];
  }
}

// ---------- Reports ----------

function zeileZuReport(row: Record<string, unknown>): StoredReport {
  const createdAt = row.created_at;
  return {
    id: row.id as string,
    status: row.status as StoredReport["status"],
    paid: row.paid as boolean,
    email: (row.email as string) ?? undefined,
    data: row.data as StoredReport["data"],
    rawReviews: (row.raw_reviews as StoredReport["rawReviews"]) ?? undefined,
    createdAt: createdAt instanceof Date ? createdAt.toISOString() : (createdAt as string),
    ownerEmail: (row.owner_email as string) ?? undefined,
    stripeSessionId: (row.stripe_session_id as string) ?? undefined,
    refunded: (row.refunded as boolean) ?? false,
    kiAnteil: (row.ki_anteil as number) ?? undefined,
    fortschritt: (row.fortschritt as StoredReport["fortschritt"]) ?? undefined,
    zitateGeloeschtAm:
      row.zitate_geloescht_am instanceof Date
        ? row.zitate_geloescht_am.toISOString()
        : ((row.zitate_geloescht_am as string) ?? undefined),
  };
}

export async function saveReport(r: StoredReport): Promise<void> {
  if (!usePg) return fsSchreiben(REPORT_DIR, r.id, r);
  const p = await getPool();
  await p.query(
    `INSERT INTO reports (id, status, paid, email, data, raw_reviews, created_at,
                          owner_email, stripe_session_id, refunded, ki_anteil, fortschritt, zitate_geloescht_am)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
     ON CONFLICT (id) DO UPDATE SET
       status=$2, paid=$3, email=$4, data=$5, raw_reviews=$6,
       owner_email=$8, stripe_session_id=$9, refunded=$10, ki_anteil=$11,
       fortschritt=$12, zitate_geloescht_am=$13`,
    [
      r.id, r.status, r.paid, r.email ?? null,
      JSON.stringify(r.data),
      r.rawReviews ? JSON.stringify(r.rawReviews) : null,
      r.createdAt,
      r.ownerEmail ?? null,
      r.stripeSessionId ?? null,
      r.refunded ?? false,
      r.kiAnteil ?? null,
      r.fortschritt ? JSON.stringify(r.fortschritt) : null,
      r.zitateGeloeschtAm ?? null,
    ]
  );
}

export async function getReport(id: string): Promise<StoredReport | null> {
  if (!usePg) return sicher(id) ? fsLesen<StoredReport>(REPORT_DIR, id) : null;
  const p = await getPool();
  const res = await p.query(`SELECT * FROM reports WHERE id = $1`, [id]);
  return res.rows.length === 0 ? null : zeileZuReport(res.rows[0]);
}

export async function deleteReport(id: string): Promise<void> {
  if (!usePg) {
    if (sicher(id)) await fs.rm(path.join(REPORT_DIR, `${id}.json`), { force: true });
    return;
  }
  const p = await getPool();
  await p.query(`DELETE FROM reports WHERE id = $1`, [id]);
}

export async function markPaid(
  id: string,
  opts?: { email?: string; stripeSessionId?: string }
): Promise<StoredReport | null> {
  const r = await getReport(id);
  if (!r) return null;
  r.paid = true;
  if (opts?.stripeSessionId) r.stripeSessionId = opts.stripeSessionId;
  const email = opts?.email ?? r.email;
  if (email) {
    r.email = email;
    r.ownerEmail = email.toLowerCase();
    await kontoAnlegen(email);
  }
  await saveReport(r);
  return r;
}

/** Alle Reports eines Kontos, neueste zuerst. */
export async function reportsFuerKonto(email: string): Promise<StoredReport[]> {
  const e = email.toLowerCase();
  if (!usePg) {
    return (await fsAlle<StoredReport>(REPORT_DIR))
      .filter((r) => r.ownerEmail === e)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
  const p = await getPool();
  const res = await p.query(
    `SELECT * FROM reports WHERE owner_email = $1 ORDER BY created_at DESC`, [e]
  );
  return res.rows.map(zeileZuReport);
}

/** Bezahlte Reports, die noch Arbeit brauchen — Futter für den Cron. */
export async function offeneVerarbeitungen(limit: number): Promise<StoredReport[]> {
  if (!usePg) {
    return (await fsAlle<StoredReport>(REPORT_DIR))
      .filter((r) => r.paid && r.status !== "ready" && !!r.rawReviews?.length)
      .slice(0, limit);
  }
  const p = await getPool();
  const res = await p.query(
    `SELECT * FROM reports
      WHERE paid = TRUE AND status <> 'ready' AND raw_reviews IS NOT NULL
      ORDER BY created_at ASC LIMIT $1`, [limit]
  );
  return res.rows.map(zeileZuReport);
}

/** Unbezahlte Reports älter als X Stunden — abgebrochene Käufe. */
export async function unbezahltAelterAls(stunden: number): Promise<string[]> {
  const grenze = new Date(Date.now() - stunden * 3600_000).toISOString();
  if (!usePg) {
    return (await fsAlle<StoredReport>(REPORT_DIR))
      .filter((r) => !r.paid && r.createdAt < grenze)
      .map((r) => r.id);
  }
  const p = await getPool();
  const res = await p.query(
    `SELECT id FROM reports WHERE paid = FALSE AND created_at < $1`, [grenze]
  );
  return res.rows.map((r) => r.id as string);
}

/** Bezahlte Reports, deren Konto seit X Monaten nicht mehr aktiv war. */
export async function abgelaufeneReports(monate: number): Promise<StoredReport[]> {
  const grenze = new Date(Date.now() - monate * 30 * 24 * 3600_000).toISOString();
  const konten = await alleKonten();
  const inaktiv = new Set(konten.filter((k) => k.lastSeenAt < grenze).map((k) => k.email));
  if (inaktiv.size === 0) return [];
  const alle = usePg
    ? (await (await getPool()).query(
        `SELECT * FROM reports WHERE owner_email = ANY($1) AND zitate_geloescht_am IS NULL`,
        [[...inaktiv]]
      )).rows.map(zeileZuReport)
    : (await fsAlle<StoredReport>(REPORT_DIR)).filter(
        (r) => r.ownerEmail && inaktiv.has(r.ownerEmail) && !r.zitateGeloeschtAm
      );
  return alle;
}

// ---------- Konten ----------

export async function kontoAnlegen(email: string): Promise<void> {
  const e = email.toLowerCase();
  const jetzt = new Date().toISOString();
  if (!usePg) {
    const vorhanden = await fsLesen<Konto>(KONTO_DIR, emailDatei(e));
    await fsSchreiben(KONTO_DIR, emailDatei(e), {
      email: e,
      createdAt: vorhanden?.createdAt ?? jetzt,
      lastSeenAt: vorhanden?.lastSeenAt ?? jetzt,
    } satisfies Konto);
    return;
  }
  const p = await getPool();
  await p.query(
    `INSERT INTO konten (email) VALUES ($1) ON CONFLICT (email) DO NOTHING`, [e]
  );
}

export async function kontoGesehen(email: string): Promise<void> {
  const e = email.toLowerCase();
  const jetzt = new Date().toISOString();
  if (!usePg) {
    const k = await fsLesen<Konto>(KONTO_DIR, emailDatei(e));
    await fsSchreiben(KONTO_DIR, emailDatei(e), {
      email: e,
      createdAt: k?.createdAt ?? jetzt,
      lastSeenAt: jetzt,
    } satisfies Konto);
    return;
  }
  const p = await getPool();
  await p.query(
    `INSERT INTO konten (email, last_seen_at) VALUES ($1, NOW())
     ON CONFLICT (email) DO UPDATE SET last_seen_at = NOW()`, [e]
  );
}

export async function kontoExistiert(email: string): Promise<boolean> {
  const e = email.toLowerCase();
  if (!usePg) return !!(await fsLesen<Konto>(KONTO_DIR, emailDatei(e)));
  const p = await getPool();
  const res = await p.query(`SELECT 1 FROM konten WHERE email = $1`, [e]);
  return res.rows.length > 0;
}

async function alleKonten(): Promise<Konto[]> {
  if (!usePg) return fsAlle<Konto>(KONTO_DIR);
  const p = await getPool();
  const res = await p.query(`SELECT * FROM konten`);
  return res.rows.map((r) => ({
    email: r.email as string,
    createdAt: r.created_at instanceof Date ? r.created_at.toISOString() : (r.created_at as string),
    lastSeenAt: r.last_seen_at instanceof Date ? r.last_seen_at.toISOString() : (r.last_seen_at as string),
  }));
}

// ---------- Login-Token (Anmeldung ohne Passwort) ----------

type TokenSatz = { token: string; email: string; expiresAt: string; used: boolean };

export async function tokenAnlegen(token: string, email: string, gueltigMinuten: number): Promise<void> {
  const e = email.toLowerCase();
  const expiresAt = new Date(Date.now() + gueltigMinuten * 60_000).toISOString();
  if (!usePg) return fsSchreiben(TOKEN_DIR, token, { token, email: e, expiresAt, used: false } satisfies TokenSatz);
  const p = await getPool();
  await p.query(
    `INSERT INTO login_token (token, email, expires_at) VALUES ($1,$2,$3)`, [token, e, expiresAt]
  );
}

// ---------- Werbe-Einwilligung (Double-Opt-in) ----------

export type Einwilligung = {
  email: string;
  token: string;
  quelle?: string;
  angefragtAm: string;
  bestaetigtAm?: string;
  widerrufenAm?: string;
};

/**
 * Trägt eine Anfrage ein (Checkbox gesetzt). Wirbt noch NICHT — dafür muss
 * erst der Link in der Bestätigungsmail geklickt werden.
 * Gibt den Token für den Bestätigungslink zurück, oder null wenn die Adresse
 * bereits bestätigt ist (dann keine zweite Mail).
 */
export async function einwilligungAnfragen(
  email: string, token: string, quelle: string
): Promise<string | null> {
  const e = email.toLowerCase();
  const jetzt = new Date().toISOString();

  if (!usePg) {
    const vorhanden = await fsLesen<Einwilligung>(EINWILLIGUNG_DIR, emailDatei(e));
    if (vorhanden?.bestaetigtAm && !vorhanden.widerrufenAm) return null;
    await fsSchreiben(EINWILLIGUNG_DIR, emailDatei(e), {
      email: e, token, quelle, angefragtAm: jetzt,
    } satisfies Einwilligung);
    return token;
  }

  const p = await getPool();
  const res = await p.query(
    `INSERT INTO einwilligungen (email, token, quelle)
     VALUES ($1,$2,$3)
     ON CONFLICT (email) DO UPDATE
       SET token = $2, quelle = $3, angefragt_am = NOW(), widerrufen_am = NULL
       WHERE einwilligungen.bestaetigt_am IS NULL OR einwilligungen.widerrufen_am IS NOT NULL
     RETURNING token`,
    [e, token, quelle]
  );
  return res.rows.length > 0 ? (res.rows[0].token as string) : null;
}

/** Klick auf den Bestätigungslink. Ab jetzt darf geworben werden. */
export async function einwilligungBestaetigen(token: string): Promise<boolean> {
  if (!sicher(token)) return false;
  if (!usePg) {
    const alle = await fsAlle<Einwilligung>(EINWILLIGUNG_DIR);
    const t = alle.find((x) => x.token === token);
    if (!t || t.bestaetigtAm) return false;
    await fsSchreiben(EINWILLIGUNG_DIR, emailDatei(t.email), {
      ...t, bestaetigtAm: new Date().toISOString(), widerrufenAm: undefined,
    });
    return true;
  }
  const p = await getPool();
  const res = await p.query(
    `UPDATE einwilligungen SET bestaetigt_am = NOW(), widerrufen_am = NULL
      WHERE token = $1 AND bestaetigt_am IS NULL RETURNING email`, [token]
  );
  return res.rows.length > 0;
}

/** Abmeldelink. Muss in jeder Werbe-Mail stehen. */
export async function einwilligungWiderrufen(token: string): Promise<boolean> {
  if (!sicher(token)) return false;
  if (!usePg) {
    const alle = await fsAlle<Einwilligung>(EINWILLIGUNG_DIR);
    const t = alle.find((x) => x.token === token);
    if (!t) return false;
    await fsSchreiben(EINWILLIGUNG_DIR, emailDatei(t.email), {
      ...t, widerrufenAm: new Date().toISOString(),
    });
    return true;
  }
  const p = await getPool();
  const res = await p.query(
    `UPDATE einwilligungen SET widerrufen_am = NOW() WHERE token = $1 RETURNING email`, [token]
  );
  return res.rows.length > 0;
}

/** Räumt verbrauchte und abgelaufene Anmelde-Token weg. Datensparsamkeit. */
export async function tokenAufraeumen(): Promise<number> {
  const jetzt = new Date().toISOString();
  if (!usePg) {
    const alle = await fsAlle<TokenSatz>(TOKEN_DIR);
    let weg = 0;
    for (const t of alle) {
      if (t.used || t.expiresAt < jetzt) {
        await fs.rm(path.join(TOKEN_DIR, `${t.token}.json`), { force: true });
        weg++;
      }
    }
    return weg;
  }
  const p = await getPool();
  const res = await p.query(`DELETE FROM login_token WHERE used = TRUE OR expires_at < NOW()`);
  return res.rowCount ?? 0;
}

/** Löst den Token ein. Gibt die E-Mail zurück, oder null bei ungültig/abgelaufen/verbraucht. */
export async function tokenEinloesen(token: string): Promise<string | null> {
  if (!sicher(token)) return null;
  if (!usePg) {
    const t = await fsLesen<TokenSatz>(TOKEN_DIR, token);
    if (!t || t.used || t.expiresAt < new Date().toISOString()) return null;
    await fsSchreiben(TOKEN_DIR, token, { ...t, used: true });
    return t.email;
  }
  const p = await getPool();
  const res = await p.query(
    `UPDATE login_token SET used = TRUE
      WHERE token = $1 AND used = FALSE AND expires_at > NOW()
      RETURNING email`, [token]
  );
  return res.rows.length > 0 ? (res.rows[0].email as string) : null;
}
