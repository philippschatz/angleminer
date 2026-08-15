import { NextRequest, NextResponse } from "next/server";
import { einwilligungBestaetigen } from "@/lib/store";

export const runtime = "nodejs";

// Ziel des Links aus der Bestätigungsmail. Erst dieser Klick macht aus der
// Anfrage eine belastbare Einwilligung — mit Zeitstempel als Nachweis.

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token") ?? "";
  const ok = await einwilligungBestaetigen(token);
  return NextResponse.redirect(
    `${req.nextUrl.origin}/newsletter?status=${ok ? "bestaetigt" : "ungueltig"}`
  );
}
