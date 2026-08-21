import Papa from "papaparse";
import { Quelle, RawReview } from "./types";

// Import aus anderen Quellen als Produktbewertungen.
//
// Bewusst OHNE Plattform-Schnittstellen: jedes Helpdesk-System exportiert CSV,
// jedes Postfach kann Nachrichten exportieren oder weiterleiten, Kommentare
// lassen sich kopieren. Das kostet den Kunden fuenf Minuten - dafuer gibt es
// keine Freigabeverfahren, keine ablaufenden Zugangsschluessel und keine
// Aenderungen, die ein Plattformbetreiber uns in den Kalender schreibt.
//
// Die Anbindungen per Schnittstelle kommen zusaetzlich, nicht stattdessen:
// siehe src/lib/konnektoren/.

const norm = (s: string) => s.trim().toLowerCase().replace(/[_-]+/g, " ").replace(/\s+/g, " ");

function pickCol(headers: string[], kandidaten: string[]): string | null {
  const n = headers.map((h) => ({ raw: h, n: norm(h) }));
  for (const k of kandidaten) {
    const hit = n.find((h) => h.n === k) ?? n.find((h) => h.n.includes(k));
    if (hit) return hit.raw;
  }
  return null;
}

// Zendesk: subject, description, created_at · Gorgias: subject, body_text
// Freshdesk: subject, description_text · Intercom: conversation_message.body
const HELPDESK_TEXT = ["description text", "body text", "description", "message body", "body", "message", "comment", "text", "nachricht", "anfrage", "beschreibung", "inhalt"];
const HELPDESK_TITEL = ["subject", "betreff", "titel", "title"];
const HELPDESK_DATUM = ["created at", "created", "datum", "date", "opened at", "first message at", "zeitpunkt"];

/** Ticket-Export aus einem Helpdesk. */
export function parseHelpdeskCsv(csv: string): { reviews: RawReview[]; warnungen: string[] } {
  const warnungen: string[] = [];
  const parsed = Papa.parse<Record<string, string>>(csv, {
    header: true, skipEmptyLines: true, transformHeader: (h) => h.trim(),
  });
  const headers = parsed.meta.fields ?? [];
  const textCol = pickCol(headers, HELPDESK_TEXT);
  const titelCol = pickCol(headers, HELPDESK_TITEL);
  const datumCol = pickCol(headers, HELPDESK_DATUM);

  if (!textCol && !titelCol) {
    return { reviews: [], warnungen: ["In dieser Datei ist keine Spalte mit Nachrichtentext zu finden."] };
  }
  if (!textCol && titelCol) {
    warnungen.push("Nur Betreffzeilen gefunden, kein Nachrichtentext — die Auswertung bleibt dadurch oberflächlich.");
  }

  const reviews: RawReview[] = [];
  parsed.data.forEach((row, i) => {
    const titel = titelCol ? String(row[titelCol] ?? "").trim() : "";
    const text = textCol ? String(row[textCol] ?? "").trim() : "";
    const body = aufraeumen(text || titel);
    if (body.length < 12) return;
    reviews.push({
      id: `s${i}`,
      body,
      title: titel && text ? titel : undefined,
      date: datumCol ? isoDatum(row[datumCol]) : undefined,
      quelle: "support",
      source: "helpdesk",
    });
  });
  return { reviews, warnungen };
}

// ---------- Postfach ----------

const ZITAT_ZEILE = /^\s*(>|\|)/;
const ANTWORT_TRENNER = /^(-{2,}\s*(urspr[üu]ngliche|original)|am .+ schrieb|on .+ wrote|von:\s|from:\s|gesendet:\s|sent:\s|-{5,}|_{5,})/i;
const SIGNATUR_TRENNER = /^(--\s*$|mit freundlichen gr|viele gr|beste gr|liebe gr|freundliche gr|best regards|kind regards|sent from|von meinem)/i;

/**
 * Holt aus einer Nachricht nur das, was diese Person selbst geschrieben hat:
 * ohne zitierten Verlauf, ohne Signatur, ohne den Rest des Threads. Ohne diesen
 * Schritt steckt in jeder Antwort der komplette Verlauf, und die Auswertung
 * zaehlt denselben Satz zwanzigmal.
 */
export function nachrichtenkern(text: string): string {
  const zeilen = text.replace(/\r\n/g, "\n").split("\n");
  const raus: string[] = [];
  for (const z of zeilen) {
    if (ANTWORT_TRENNER.test(z.trim())) break;
    if (SIGNATUR_TRENNER.test(z.trim())) break;
    if (ZITAT_ZEILE.test(z)) continue;
    raus.push(z);
  }
  return aufraeumen(raus.join("\n"));
}

const MBOX_TRENNER = /^From \S+.*\d{4}$/m;

/** Postfach-Export (.mbox) oder eine einzelne Nachricht (.eml). */
export function parsePostfach(inhalt: string, quelle: Quelle = "mail"): { reviews: RawReview[]; warnungen: string[] } {
  const teile = inhalt.split(new RegExp(MBOX_TRENNER.source, "m")).filter((t) => t.trim().length > 0);
  const reviews: RawReview[] = [];
  const warnungen: string[] = [];

  teile.forEach((teil, i) => {
    // Kopfzeilen und Rumpf trennen: erste Leerzeile.
    const trenn = teil.indexOf("\n\n");
    const kopf = trenn > 0 ? teil.slice(0, trenn) : "";
    const rumpf = trenn > 0 ? teil.slice(trenn + 2) : teil;

    const datum = /^date:\s*(.+)$/im.exec(kopf)?.[1];
    const betreff = /^subject:\s*(.+)$/im.exec(kopf)?.[1]?.trim();

    // Automatisches nicht mitzaehlen — Bestellbestaetigungen und Newsletter
    // sagen nichts ueber Kunden aus.
    if (kopf && /^(precedence|auto-submitted|x-autoreply|list-unsubscribe):/im.test(kopf)) return;

    const body = nachrichtenkern(rumpf);
    if (body.length < 20) return;
    reviews.push({
      id: `m${i}`,
      body,
      title: betreff && !/^(re|aw|fwd|wg):/i.test(betreff) ? betreff : undefined,
      date: datum ? isoDatum(datum) : undefined,
      quelle,
      source: "postfach",
    });
  });

  if (reviews.length === 0) {
    warnungen.push("In dieser Datei sind keine lesbaren Nachrichten zu finden. Erwartet wird ein Postfach-Export (.mbox) oder eine einzelne Nachricht (.eml).");
  }
  return { reviews, warnungen };
}

// ---------- Kommentare ----------

/**
 * Kommentare unter Anzeigen und Beitraegen. Einer pro Zeile oder Absatz.
 * Hier stehen die Fragen, die Leute VOR dem Kauf stellen.
 */
export function parseKommentare(text: string): { reviews: RawReview[]; warnungen: string[] } {
  const stuecke = text
    .split(/\n\s*\n|\n/)
    .map((z) => aufraeumen(z.replace(/^\s*@\S+\s*/, "").replace(/^\s*[-•*]\s*/, "")))
    .filter((z) => z.length >= 8);
  return {
    reviews: stuecke.map((body, i) => ({ id: `k${i}`, body, quelle: "kommentar" as Quelle, source: "kommentare" })),
    warnungen: stuecke.length < 20 ? ["Wenige Kommentare erkannt — pro Zeile wird ein Kommentar gezählt."] : [],
  };
}

// ---------- gemeinsam ----------

function aufraeumen(s: string): string {
  return s
    .replace(/ /g, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function isoDatum(v: unknown): string | undefined {
  if (!v) return undefined;
  const s = String(v).trim();
  const de = s.match(/^(\d{1,2})\.(\d{1,2})\.(\d{2,4})/);
  if (de) {
    const [, d, m, y] = de;
    const iso = `${y.length === 2 ? "20" + y : y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
    if (!isNaN(Date.parse(iso))) return iso;
  }
  const t = Date.parse(s);
  return isNaN(t) ? undefined : new Date(t).toISOString().slice(0, 10);
}
