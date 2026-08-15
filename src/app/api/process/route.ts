import { NextRequest, NextResponse } from "next/server";
import { getReport, saveReport } from "@/lib/store";
import { llmTag } from "@/lib/pipeline/tagger-llm";
import { buildReport } from "@/lib/pipeline/aggregate";
import { enhanceReport } from "@/lib/pipeline/enhance";

export const runtime = "nodejs";
export const maxDuration = 300; // LLM-Tagging von bis zu 5.000 Reviews

// Nach Zahlung: Heuristik-Report → LLM-Report upgraden.
export async function POST(req: NextRequest) {
  const { id } = (await req.json()) as { id?: string };
  if (!id) return NextResponse.json({ error: "id fehlt" }, { status: 400 });

  const report = await getReport(id);
  if (!report) return NextResponse.json({ error: "nicht gefunden" }, { status: 404 });
  if (!report.paid) return NextResponse.json({ error: "nicht bezahlt" }, { status: 402 });
  if (report.status === "ready") return NextResponse.json({ status: "ready" });
  if (report.status === "processing") return NextResponse.json({ status: "processing" });

  // Ohne LLM-Key oder ohne Rohdaten: Heuristik-Report ist der finale Report.
  if (!process.env.ANTHROPIC_API_KEY || !report.rawReviews?.length) {
    report.status = "ready";
    report.rawReviews = undefined;
    await saveReport(report);
    return NextResponse.json({ status: "ready" });
  }

  report.status = "processing";
  await saveReport(report);

  try {
    const ergebnis = await llmTag(report.rawReviews);
    if (ergebnis) {
      let data = buildReport({
        id: report.id,
        tagged: ergebnis.tagged,
        cleanStats: report.data.cleanStats,
        brandName: report.data.brandName,
        category: report.data.category,
        email: report.email,
        llmEnhanced: false,
      });
      data = await enhanceReport(data);
      report.data = data;
    }
    report.status = "ready";
    report.rawReviews = undefined; // Datensparsamkeit: Rohdaten nach Verarbeitung löschen
    await saveReport(report);
    return NextResponse.json({ status: "ready" });
  } catch (e) {
    console.error("process failed", e);
    report.status = "ready"; // Heuristik-Report bleibt gültig — kein kaputter Kaufflow
    await saveReport(report);
    return NextResponse.json({ status: "ready", degraded: true });
  }
}
