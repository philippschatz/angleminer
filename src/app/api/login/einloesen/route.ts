import { NextRequest, NextResponse } from "next/server";
import { kontoGesehen, tokenEinloesen } from "@/lib/store";
import { COOKIE_NAME, cookieOptionen, sitzungBauen } from "@/lib/session";

export const runtime = "nodejs";

// Ziel des Links aus der Anmeldemail. Löst den Einmal-Token ein, setzt das
// Sitzungs-Cookie und leitet ins Konto weiter.

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token") ?? "";
  const basis = req.nextUrl.origin;

  const email = await tokenEinloesen(token);
  if (!email) {
    return NextResponse.redirect(`${basis}/login?fehler=link`);
  }

  await kontoGesehen(email);
  const { wert, maxAge } = sitzungBauen(email);
  const res = NextResponse.redirect(`${basis}/konto`);
  res.cookies.set(COOKIE_NAME, wert, { ...cookieOptionen, maxAge });
  return res;
}
