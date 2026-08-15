import { NextRequest, NextResponse } from "next/server";
import { einwilligungStarten } from "@/lib/newsletter";
import { einwilligung as copy } from "@/content/copy";

export const runtime = "nodejs";

// Eigenständige Eintragung aus der Vorschau — für Leute, die (noch) nicht
// kaufen. Antwortet immer gleich, damit sich hier nicht abfragen lässt, wer
// schon eingetragen ist.

export async function POST(req: NextRequest) {
  try {
    const { email } = (await req.json()) as { email?: string };
    const sauber = String(email ?? "").trim().slice(0, 200);
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(sauber)) {
      return NextResponse.json({ error: copy.vorschauFehler }, { status: 400 });
    }
    await einwilligungStarten(sauber, "vorschau", req.nextUrl.origin);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Newsletter-Eintragung fehlgeschlagen", e);
    return NextResponse.json({ error: copy.vorschauFehler }, { status: 500 });
  }
}
