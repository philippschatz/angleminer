import { NextRequest, NextResponse } from "next/server";
import { kontoExistiert, tokenAnlegen } from "@/lib/store";
import { neuerToken, TOKEN_GUELTIG_MINUTEN } from "@/lib/session";
import { anmeldeMail, basisUrl } from "@/lib/mail";
import { konto as copy } from "@/content/copy";

export const runtime = "nodejs";

// Fordert einen Anmeldelink an.
//
// Antwortet IMMER gleich — egal ob es das Konto gibt oder nicht. Sonst wäre
// diese Seite ein Werkzeug, um herauszufinden, welche Marken hier Kunde sind.

export async function POST(req: NextRequest) {
  let email = "";
  try {
    const body = (await req.json()) as { email?: string };
    email = String(body.email ?? "").trim().toLowerCase().slice(0, 200);
  } catch {
    return NextResponse.json({ error: copy.loginFehler }, { status: 400 });
  }

  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return NextResponse.json({ error: copy.loginFehler }, { status: 400 });
  }

  try {
    if (await kontoExistiert(email)) {
      const token = neuerToken();
      await tokenAnlegen(token, email, TOKEN_GUELTIG_MINUTEN);
      const link = `${basisUrl(req.nextUrl.origin)}/api/login/einloesen?token=${token}`;
      await anmeldeMail(email, link);
    }
  } catch (e) {
    console.error("Anmeldelink fehlgeschlagen", e);
    return NextResponse.json({ error: copy.loginFehler }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
