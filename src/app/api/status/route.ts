import { NextRequest, NextResponse } from "next/server";
import { getReport } from "@/lib/store";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id fehlt" }, { status: 400 });
  const report = await getReport(id);
  if (!report) return NextResponse.json({ error: "nicht gefunden" }, { status: 404 });
  return NextResponse.json({
    status: report.status,
    paid: report.paid,
    erledigt: report.fortschritt?.erledigt ?? 0,
    gesamt: report.fortschritt?.gesamt ?? 0,
  });
}
