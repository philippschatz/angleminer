import { NextRequest, NextResponse } from "next/server";
import { offeneVerarbeitungen } from "@/lib/store";
import { verarbeitungsSchritt } from "@/lib/verarbeitung";

export const runtime = "nodejs";
// Siehe /api/process: 60 s ist die Obergrenze des Hobby-Tarifs.
export const maxDuration = 60;

// Läuft nach Zeitplan (siehe vercel.json) und holt alles nach, was liegen
// geblieben ist: Reports, deren Verarbeitung nie angestoßen wurde, und solche,
// die mitten in einer Portion im Zeitlimit hängengeblieben sind.
//
// Damit ist der Browser-Tab des Käufers kein notwendiger Bestandteil mehr.
// Er darf ihn zumachen, sein Gerät wechseln oder in den Zug steigen.

const BUDGET_MS = 55_000;
const MAX_REPORTS_PRO_LAUF = 2;

function befugt(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return process.env.NODE_ENV !== "production";
  return req.headers.get("authorization") === `Bearer ${secret}`;
}

export async function GET(req: NextRequest) {
  if (!befugt(req)) return NextResponse.json({ error: "nicht befugt" }, { status: 401 });

  const start = Date.now();
  const offen = await offeneVerarbeitungen(MAX_REPORTS_PRO_LAUF);
  const ergebnisse: { id: string; erledigt: number; gesamt: number; fertig: boolean }[] = [];

  for (const report of offen) {
    const rest = BUDGET_MS - (Date.now() - start);
    if (rest < 20_000) break; // zu wenig übrig für eine sinnvolle Portion
    try {
      const res = await verarbeitungsSchritt(report, rest);
      ergebnisse.push({ id: report.id, erledigt: res.erledigt, gesamt: res.gesamt, fertig: res.fertig });
    } catch (e) {
      console.error("Verarbeitung fehlgeschlagen", report.id, e);
    }
  }

  return NextResponse.json({ geprueft: offen.length, ergebnisse });
}
