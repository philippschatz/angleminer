import { parseReviewsCsv, parsePastedText } from "./parse";
import { cleanReviews } from "./clean";
import { heuristicTag } from "./tagger";
import { buildReport } from "./aggregate";
import { CleanStats, RawReview, ReportData } from "./types";

// Läuft VOLLSTÄNDIG im Browser des Kunden. Einlesen, Putzen, PII-Entfernen und
// die Gratis-Vorschau entstehen auf seinem Rechner — nichts davon berührt den
// Server. Erst beim Klick auf "Kaufen" wandert das Ergebnis von
// hochladbareReviews() zu uns, und das enthält bewusst nur Text, Sterne, Datum.

export const MAX_REVIEWS = 5000;
export const MIN_REVIEWS = 30;
export const MIN_NACH_REINIGUNG = 20;

/** Genau die Felder, die den Rechner des Kunden verlassen dürfen. */
export type UploadReview = {
  id: string;
  text: string;
  rating?: number;
  date?: string;
};

export type VorschauErgebnis = {
  vorschau: ReportData;
  upload: UploadReview[];
  cleanStats: CleanStats;
  warnungen: string[];
  /** Wie viele Reviews über MAX_REVIEWS hinausgingen und abgeschnitten wurden. */
  abgeschnitten: number;
};

export class VorschauFehler extends Error {}

/**
 * Baut aus Rohtext die komplette Gratis-Vorschau — ohne Serverkontakt.
 * Wirft VorschauFehler mit einer Meldung, die direkt anzeigbar ist.
 */
export function vorschauBauen(args: {
  csv?: string;
  eingefuegt?: string;
  brandName: string;
  category: string;
  texte: {
    keineBewertungen: string;
    zuWenigBewertungen: string;
    zuVieleGefiltert: string;
  };
}): VorschauErgebnis {
  const { csv, eingefuegt, brandName, category, texte } = args;

  const parsed = csv ? parseReviewsCsv(csv) : parsePastedText(eingefuegt ?? "");
  if (parsed.reviews.length === 0) {
    throw new VorschauFehler(parsed.warnings[0] ?? texte.keineBewertungen);
  }
  if (parsed.reviews.length < MIN_REVIEWS) {
    throw new VorschauFehler(texte.zuWenigBewertungen.replace("{anzahl}", String(parsed.reviews.length)));
  }

  const abgeschnitten = Math.max(0, parsed.reviews.length - MAX_REVIEWS);
  const capped = parsed.reviews.slice(0, MAX_REVIEWS);

  const { kept, stats } = cleanReviews(capped);
  if (kept.length < MIN_NACH_REINIGUNG) {
    throw new VorschauFehler(texte.zuVieleGefiltert);
  }

  // Namen bleiben auf dem Rechner des Kunden. Schon in der Vorschau raus, damit
  // der bezahlte Report exakt so aussieht wie das, was hier gezeigt wurde.
  const ohneNamen: RawReview[] = kept.map((r) => ({ ...r, author: undefined, product: undefined }));

  const tagged = heuristicTag(ohneNamen);
  const vorschau = buildReport({
    id: "vorschau",
    tagged,
    cleanStats: stats,
    brandName,
    category,
    llmEnhanced: false,
  });

  return {
    vorschau,
    upload: ohneNamen.map((r) => ({
      id: r.id,
      text: r.title ? `${r.title} — ${r.body}` : r.body,
      rating: r.rating,
      date: r.date,
    })),
    cleanStats: stats,
    warnungen: parsed.warnings,
    abgeschnitten,
  };
}
