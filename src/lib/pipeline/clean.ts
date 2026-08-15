import { CleanStats, RawReview } from "./types";

// Cleaning: Dedupe, Junk-Filter, PII-Scrub, Seeding-Gegenprobe.
// Ehrlichkeit ist Feature: alles, was entfernt wird, wird gezählt und ausgewiesen.

const JUNK_PATTERNS = [
  /^\*+$/, // nur Sternchen
  /^\(?redacted\)?$/i,
  /^[.\-_/\\ ]+$/,
  /^(ok|gut|top|super|passt|nice|good|fine|👍+)$/i,
];

const PII_RULES: { re: RegExp; repl: string }[] = [
  { re: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, repl: "[email entfernt]" },
  { re: /\b(?:S|E|OR|DE|AT|CH)?[-#]?\d{6,10}\b/g, repl: "[nr entfernt]" }, // Bestell-/Kundennummern
  { re: /\bDE\d{2}[0-9 ]{18,22}\b/g, repl: "[iban entfernt]" },
  { re: /(\+?\d{2,4}[\s/-]?)?\(?\d{3,5}\)?[\s/-]?\d{5,8}/g, repl: "[tel entfernt]" },
  { re: /https?:\/\/\S+/g, repl: "[link entfernt]" },
];

function normalizeBody(s: string): string {
  return s.toLowerCase().replace(/[^\p{L}\p{N} ]/gu, "").replace(/\s+/g, " ").trim();
}

function scrubPii(s: string): { text: string; hit: boolean } {
  let hit = false;
  let out = s;
  for (const { re, repl } of PII_RULES) {
    if (re.test(out)) {
      hit = true;
      out = out.replace(re, repl);
    }
    re.lastIndex = 0;
  }
  return { text: out, hit };
}

// Nur Vorname behalten
function scrubAuthor(a?: string): string | undefined {
  if (!a) return undefined;
  const first = a.trim().split(/\s+/)[0];
  if (!first || first.length < 2) return undefined;
  return first.charAt(0).toUpperCase() + first.slice(1);
}

const SEEDING_THRESHOLD = 20; // identischer Body >= 20x => Seeding-Verdacht (ausweisen)
const DUP_KEEP = 1;

export function cleanReviews(input: RawReview[]): { kept: RawReview[]; stats: CleanStats } {
  let junk = 0;
  let piiScrubbed = 0;
  let duplicates = 0;

  // 1. Junk raus
  const nonJunk = input.filter((r) => {
    const b = r.body.trim();
    if (b.length < 3) { junk++; return false; }
    if (JUNK_PATTERNS.some((p) => p.test(b))) { junk++; return false; }
    return true;
  });

  // 2. Dedupe (normalisierter Body), Zählung für Seeding-Check behalten
  const byBody = new Map<string, RawReview[]>();
  for (const r of nonJunk) {
    const key = normalizeBody(r.body);
    const arr = byBody.get(key) ?? [];
    arr.push(r);
    byBody.set(key, arr);
  }

  const seeding: { body: string; count: number }[] = [];
  const kept: RawReview[] = [];
  for (const [key, arr] of byBody) {
    if (arr.length >= SEEDING_THRESHOLD && key.split(" ").length >= 4) {
      seeding.push({ body: arr[0].body.slice(0, 120), count: arr.length });
    }
    duplicates += arr.length - DUP_KEEP;
    kept.push(...arr.slice(0, DUP_KEEP));
  }

  // 3. PII-Scrub
  const scrubbed = kept.map((r) => {
    const bodyRes = scrubPii(r.body);
    const titleRes = r.title ? scrubPii(r.title) : { text: undefined as string | undefined, hit: false };
    if (bodyRes.hit || titleRes.hit) piiScrubbed++;
    return {
      ...r,
      body: bodyRes.text,
      title: titleRes.text,
      author: scrubAuthor(r.author),
    };
  });

  return {
    kept: scrubbed,
    stats: {
      input: input.length,
      kept: scrubbed.length,
      duplicates,
      junk,
      piiScrubbed,
      seedingAlert: seeding.length > 0 ? seeding.sort((a, b) => b.count - a.count).slice(0, 5) : null,
    },
  };
}
