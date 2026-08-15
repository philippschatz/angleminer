import { createHmac, randomBytes, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

// Anmeldung ohne Passwort: Der Kunde bekommt einen Einmal-Link per Mail, löst
// ihn ein und bekommt ein signiertes Cookie. Kein Passwort, das jemand
// vergessen, wiederverwenden oder das bei uns liegen könnte.

export const COOKIE_NAME = "am_sitzung";
const GUELTIG_TAGE = 90;
export const TOKEN_GUELTIG_MINUTEN = 30;

function geheimnis(): string {
  const s = process.env.SESSION_SECRET;
  if (s) return s;
  if (process.env.NODE_ENV === "production") {
    throw new Error("SESSION_SECRET fehlt — ohne den ist die Anmeldung nicht sicher.");
  }
  return "dev-geheimnis-nur-lokal";
}

const b64url = (b: Buffer) => b.toString("base64url");

function signieren(nutzlast: string): string {
  return createHmac("sha256", geheimnis()).update(nutzlast).digest("base64url");
}

/** Erzeugt den Cookie-Wert für eine E-Mail. */
export function sitzungBauen(email: string): { wert: string; maxAge: number } {
  const ablauf = Date.now() + GUELTIG_TAGE * 24 * 3600_000;
  const nutzlast = b64url(Buffer.from(JSON.stringify({ e: email.toLowerCase(), x: ablauf })));
  return { wert: `${nutzlast}.${signieren(nutzlast)}`, maxAge: GUELTIG_TAGE * 24 * 3600 };
}

/** Prüft Signatur und Ablauf. Gibt die E-Mail zurück oder null. */
export function sitzungLesen(wert: string | undefined): string | null {
  if (!wert) return null;
  const [nutzlast, signatur] = wert.split(".");
  if (!nutzlast || !signatur) return null;

  const erwartet = Buffer.from(signieren(nutzlast));
  const geliefert = Buffer.from(signatur);
  if (erwartet.length !== geliefert.length || !timingSafeEqual(erwartet, geliefert)) return null;

  try {
    const { e, x } = JSON.parse(Buffer.from(nutzlast, "base64url").toString());
    if (typeof e !== "string" || typeof x !== "number" || x < Date.now()) return null;
    return e;
  } catch {
    return null;
  }
}

/** Angemeldete E-Mail in Server-Komponenten. */
export async function angemeldetAls(): Promise<string | null> {
  const c = await cookies();
  return sitzungLesen(c.get(COOKIE_NAME)?.value);
}

export function neuerToken(): string {
  return randomBytes(24).toString("base64url").replace(/[^a-zA-Z0-9_-]/g, "");
}

export const cookieOptionen = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
};
