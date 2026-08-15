import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { parseReviewsCsv, parsePastedText } from "@/lib/pipeline/parse";
import { cleanReviews } from "@/lib/pipeline/clean";
import { heuristicTag } from "@/lib/pipeline/tagger";
import { buildReport } from "@/lib/pipeline/aggregate";
import { saveReport } from "@/lib/store";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_REVIEWS = 5000;
const MAX_BYTES = 15 * 1024 * 1024;

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const brandName = String(form.get("brandName") ?? "").trim().slice(0, 80) || "Deine Marke";
    const category = String(form.get("category") ?? "").trim().slice(0, 80) || "E-Commerce";
    const email = String(form.get("email") ?? "").trim().slice(0, 200) || undefined;
    const pasted = String(form.get("pasted") ?? "").trim();
    const file = form.get("file") as File | null;

    let csv = "";
    if (file && file.size > 0) {
      if (file.size > MAX_BYTES) {
        return NextResponse.json({ error: "Datei zu groß (max. 15 MB). Exportiere ggf. nur die Review-Spalten." }, { status: 400 });
      }
      csv = await file.text();
    }

    const parsed = csv ? parseReviewsCsv(csv) : parsePastedText(pasted);
    if (parsed.reviews.length === 0) {
      return NextResponse.json({ error: parsed.warnings[0] ?? "Keine Reviews gefunden." }, { status: 400 });
    }
    if (parsed.reviews.length < 30) {
      return NextResponse.json({
        error: `Nur ${parsed.reviews.length} Reviews erkannt. Unter 30 Reviews wird der Report dünn — wir verkaufen dir lieber keinen. Ab ~100 Reviews wird es gut.`,
      }, { status: 400 });
    }

    const capped = parsed.reviews.slice(0, MAX_REVIEWS);
    const { kept, stats } = cleanReviews(capped);
    if (kept.length < 20) {
      return NextResponse.json({ error: "Nach Duplikat- und Junk-Filter bleiben zu wenige echte Reviews übrig." }, { status: 400 });
    }

    // Preview: kostenlose Heuristik. Das LLM-Tagging läuft nach Zahlung (/api/process).
    const tagged = heuristicTag(kept);
    const id = nanoid(12);
    const data = buildReport({ id, tagged, cleanStats: stats, brandName, category, email, llmEnhanced: false });

    await saveReport({
      id,
      status: "preview",
      paid: false,
      email,
      data,
      rawReviews: kept,
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ id, warnings: parsed.warnings });
  } catch (e) {
    console.error("analyze failed", e);
    return NextResponse.json({ error: "Analyse fehlgeschlagen. Prüfe das Dateiformat (CSV/XLSX als CSV exportiert)." }, { status: 500 });
  }
}
