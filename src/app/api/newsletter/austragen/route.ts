import { NextRequest, NextResponse } from "next/server";
import { einwilligungWiderrufen } from "@/lib/store";

export const runtime = "nodejs";

// Abmeldelink. Muss in JEDER Werbe-Mail stehen und ohne Rückfrage funktionieren.

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token") ?? "";
  const ok = await einwilligungWiderrufen(token);
  return NextResponse.redirect(
    `${req.nextUrl.origin}/newsletter?status=${ok ? "abgemeldet" : "ungueltig"}`
  );
}
