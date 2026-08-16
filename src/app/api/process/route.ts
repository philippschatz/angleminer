import { NextRequest, NextResponse } from "next/server";
import { getReport } from "@/lib/store";
import { verarbeitungsSchritt } from "@/lib/verarbeitung";

export const runtime = "nodejs";
// 60 s ist das Maximum des Hobby-Tarifs. Auf Pro sind 300 möglich — dann hier
// und in /api/cron/verarbeiten hochsetzen, das beschleunigt grosse Reports.
export const maxDuration = 60;

// Sofortstart, wenn der Käufer nach der Zahlung noch auf der Seite ist —
// dann muss er nicht auf den nächsten Zeitplan-Lauf warten.
//
// Kein notwendiger Bestandteil: Schließt er den Tab, holt der Zeitplan alles
// nach. Deshalb wird hier auch nichts mehr in einen Hängezustand geschrieben,
// aus dem nichts mehr herauskommt.

const BUDGET_MS = 55_000;

export async function POST(req: NextRequest) {
  const { id } = (await req.json()) as { id?: string };
  if (!id) return NextResponse.json({ error: "id fehlt" }, { status: 400 });

  const report = await getReport(id);
  if (!report) return NextResponse.json({ error: "nicht gefunden" }, { status: 404 });
  if (!report.paid) return NextResponse.json({ error: "nicht bezahlt" }, { status: 402 });
  if (report.status === "ready") return NextResponse.json({ status: "ready" });

  try {
    const res = await verarbeitungsSchritt(report, BUDGET_MS);
    return NextResponse.json({
      status: res.status,
      erledigt: res.erledigt,
      gesamt: res.gesamt,
    });
  } catch (e) {
    console.error("Verarbeitung fehlgeschlagen", id, e);
    // Der Zeitplan versucht es weiter — der Report bleibt gültig.
    return NextResponse.json({ status: "processing", degraded: true });
  }
}
