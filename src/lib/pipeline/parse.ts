import Papa from "papaparse";
import { RawReview } from "./types";

// Spalten-Heuristiken für die gängigen Review-Export-Formate.
// Judge.me: title, body, rating, reviewer_name, review_date / created_at, product_title
// Yotpo: review_title, review_content, review_score, display_name, created_at, product_name
// Loox: title, review, rating, name, date, product
// Trustpilot: Titel/Title, Bewertungstext/Review Content, Sterne/Stars, Datum
// Trusted Shops: comment, mark/grade, date
// Amazon: Titel, Text/Inhalt, Sterne, Datum
const BODY_COLS = ["body", "review_content", "review", "content", "text", "kommentar", "comment", "bewertungstext", "review text", "inhalt", "review body", "beschreibung"];
const TITLE_COLS = ["title", "review_title", "titel", "überschrift", "headline"];
const RATING_COLS = ["rating", "review_score", "score", "stars", "sterne", "mark", "grade", "bewertung", "note"];
const DATE_COLS = ["review_date", "created_at", "date", "datum", "submitted_at", "created", "zeitpunkt"];
const AUTHOR_COLS = ["reviewer_name", "display_name", "name", "author", "kunde", "reviewer", "verfasser", "customer_name"];
const PRODUCT_COLS = ["product_title", "product_name", "product", "produkt", "artikel", "item", "product handle"];

function norm(s: string): string {
  return s.trim().toLowerCase().replace(/[_-]+/g, " ").replace(/\s+/g, " ");
}

function pickCol(headers: string[], candidates: string[]): string | null {
  const normed = headers.map((h) => ({ raw: h, n: norm(h) }));
  for (const c of candidates) {
    const hit = normed.find((h) => h.n === c || h.n.includes(c));
    if (hit) return hit.raw;
  }
  return null;
}

function parseRating(v: unknown): number | undefined {
  if (v === null || v === undefined || v === "") return undefined;
  const s = String(v).replace(",", ".");
  const m = s.match(/(\d+(?:\.\d+)?)/);
  if (!m) return undefined;
  let n = parseFloat(m[1]);
  if (n > 5 && n <= 10) n = n / 2; // 10er-Skala
  if (n > 10 && n <= 100) n = n / 20; // Prozent-Skala
  if (n < 0 || n > 5) return undefined;
  return Math.round(n * 10) / 10;
}

function parseDate(v: unknown): string | undefined {
  if (!v) return undefined;
  const s = String(v).trim();
  // dd.mm.yyyy
  const de = s.match(/^(\d{1,2})\.(\d{1,2})\.(\d{2,4})/);
  if (de) {
    const [, d, m, y] = de;
    const year = y.length === 2 ? `20${y}` : y;
    const iso = `${year}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
    if (!isNaN(Date.parse(iso))) return iso;
  }
  const t = Date.parse(s);
  if (!isNaN(t)) return new Date(t).toISOString().slice(0, 10);
  return undefined;
}

export type ParseResult = {
  reviews: RawReview[];
  warnings: string[];
  detectedColumns: Record<string, string | null>;
};

export function parseReviewsCsv(csv: string): ParseResult {
  const warnings: string[] = [];
  const parsed = Papa.parse<Record<string, string>>(csv, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim(),
  });
  if (parsed.errors.length > 0) {
    warnings.push(`${parsed.errors.length} Zeilen konnten nicht sauber gelesen werden und wurden übersprungen.`);
  }
  const headers = parsed.meta.fields ?? [];
  const bodyCol = pickCol(headers, BODY_COLS);
  const titleCol = pickCol(headers, TITLE_COLS);
  const ratingCol = pickCol(headers, RATING_COLS);
  const dateCol = pickCol(headers, DATE_COLS);
  const authorCol = pickCol(headers, AUTHOR_COLS);
  const productCol = pickCol(headers, PRODUCT_COLS);

  if (!bodyCol) {
    // Fallback: längste Textspalte nehmen
    const sample = parsed.data.slice(0, 50);
    let best: string | null = null;
    let bestLen = 0;
    for (const h of headers) {
      const avg = sample.reduce((a, r) => a + String(r[h] ?? "").length, 0) / Math.max(1, sample.length);
      if (avg > bestLen) { bestLen = avg; best = h; }
    }
    if (best && bestLen >= 20) {
      warnings.push(`Keine eindeutige Text-Spalte gefunden — "${best}" wurde als Review-Text interpretiert.`);
      return buildResult(parsed.data, { bodyCol: best, titleCol, ratingCol, dateCol, authorCol, productCol }, warnings);
    }
    return { reviews: [], warnings: ["Keine Review-Text-Spalte gefunden. Bitte prüfe, ob die Datei ein Review-Export ist."], detectedColumns: {} };
  }
  return buildResult(parsed.data, { bodyCol, titleCol, ratingCol, dateCol, authorCol, productCol }, warnings);
}

function buildResult(
  rows: Record<string, string>[],
  cols: { bodyCol: string; titleCol: string | null; ratingCol: string | null; dateCol: string | null; authorCol: string | null; productCol: string | null },
  warnings: string[]
): ParseResult {
  const reviews: RawReview[] = [];
  rows.forEach((row, i) => {
    const body = String(row[cols.bodyCol] ?? "").trim();
    if (!body) return;
    reviews.push({
      id: `r${i}`,
      body,
      title: cols.titleCol ? String(row[cols.titleCol] ?? "").trim() || undefined : undefined,
      rating: cols.ratingCol ? parseRating(row[cols.ratingCol]) : undefined,
      date: cols.dateCol ? parseDate(row[cols.dateCol]) : undefined,
      author: cols.authorCol ? String(row[cols.authorCol] ?? "").trim() || undefined : undefined,
      product: cols.productCol ? String(row[cols.productCol] ?? "").trim() || undefined : undefined,
    });
  });
  return {
    reviews,
    warnings,
    detectedColumns: {
      text: cols.bodyCol, titel: cols.titleCol, bewertung: cols.ratingCol,
      datum: cols.dateCol, autor: cols.authorCol, produkt: cols.productCol,
    },
  };
}

// Freitext-Eingabe: eine Review pro Absatz/Zeile
export function parsePastedText(text: string): ParseResult {
  const chunks = text
    .split(/\n\s*\n|\r\n\s*\r\n/)
    .flatMap((c) => (c.length > 600 ? c.split(/\n/) : [c]))
    .map((c) => c.trim())
    .filter((c) => c.length >= 5);
  return {
    reviews: chunks.map((body, i) => ({ id: `p${i}`, body })),
    warnings: chunks.length < 20 ? ["Wenige Reviews erkannt — pro Absatz wird eine Review gezählt."] : [],
    detectedColumns: { text: "eingefügter Text" },
  };
}
