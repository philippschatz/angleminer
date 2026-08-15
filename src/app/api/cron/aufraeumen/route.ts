import { NextRequest, NextResponse } from "next/server";
import { abgelaufeneReports, deleteReport, saveReport, unbezahltAelterAls } from "@/lib/store";

export const runtime = "nodejs";
export const maxDuration = 120;

// Zwei Aufräumarbeiten, beide aus dem Architektur-Interview:
//
// 1. Abgebrochene Käufe: Wer auf Freischalten geklickt, aber nie bezahlt hat,
//    hinterlässt Bewertungstexte bei uns. Die fliegen nach 24 Stunden raus.
// 2. Inaktive Konten: Nach 24 Monaten ohne Anmeldung werden Zitate und Texte
//    aus den Reports entfernt. Die Zahlen bleiben — damit ein späterer
//    Vergleichsbericht weiter möglich ist.

const UNBEZAHLT_STUNDEN = 24;
const INAKTIV_MONATE = 24;

function befugt(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return process.env.NODE_ENV !== "production";
  return req.headers.get("authorization") === `Bearer ${secret}`;
}

export async function GET(req: NextRequest) {
  if (!befugt(req)) return NextResponse.json({ error: "nicht befugt" }, { status: 401 });

  const verwaist = await unbezahltAelterAls(UNBEZAHLT_STUNDEN);
  for (const id of verwaist) await deleteReport(id);

  const abgelaufen = await abgelaufeneReports(INAKTIV_MONATE);
  for (const r of abgelaufen) {
    // Zitate und Texte raus, Zahlen bleiben stehen.
    r.data = {
      ...r.data,
      angles: r.data.angles.map((a) => ({ ...a, quotes: [] })),
      objections: r.data.objections.map((o) => ({ ...o, quotes: [], counterQuotes: [] })),
      scrollstoppers: [],
      wording: { kunden: [] },
    };
    r.rawReviews = undefined;
    r.zitateGeloeschtAm = new Date().toISOString();
    await saveReport(r);
  }

  return NextResponse.json({
    abgebrocheneKaeufeGeloescht: verwaist.length,
    zitateEntfernt: abgelaufen.length,
  });
}
