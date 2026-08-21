import { parseReviewsCsv, parsePastedText } from "./parse";
import { parseHelpdeskCsv, parseKommentare, parsePostfach } from "./quellen";
import { cleanReviews } from "./clean";
import { heuristicTag } from "./tagger";
import { buildReport } from "./aggregate";
import { CleanStats, Quelle, RawReview, ReportData } from "./types";

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
  /** Art der Quelle — kein Personenbezug, aber entscheidend für die Auswertung. */
  quelle?: Quelle;
};

/**
 * Eine hinzugefügte Quelle. Mehrere sind der Punkt: Bewertungen zeigen das
 * freundliche Bild, Support und Kommentare das ungefilterte.
 */
export type QuellenArt = "bewertungen" | "helpdesk" | "postfach" | "kommentare";

export type QuellenEingabe = {
  art: QuellenArt;
  /** Dateiinhalt oder eingefügter Text. */
  inhalt: string;
  /** Nur zur Anzeige. */
  name?: string;
};

export const QUELLEN_ARTEN: { art: QuellenArt; label: string; hinweis: string; quelle: Quelle }[] = [
  { art: "bewertungen", label: "Produktbewertungen", quelle: "bewertung",
    hinweis: "CSV-Export aus Judge.me, Yotpo, Loox, Trustpilot, Trusted Shops oder Amazon." },
  { art: "helpdesk", label: "Support-Anfragen", quelle: "support",
    hinweis: "Ticket-Export aus Zendesk, Gorgias, Freshdesk oder Intercom. Hier stehen die echten Kaufbarrieren." },
  { art: "postfach", label: "Postfach", quelle: "mail",
    hinweis: "Export aus Outlook oder Gmail (.mbox oder .eml). Zitierter Verlauf und Signaturen fliegen automatisch raus." },
  { art: "kommentare", label: "Kommentare", quelle: "kommentar",
    hinweis: "Kommentare unter Anzeigen und Beiträgen, einer pro Zeile. Hier stehen die Fragen von vor dem Kauf." },
];

export type VorschauErgebnis = {
  vorschau: ReportData;
  upload: UploadReview[];
  cleanStats: CleanStats;
  warnungen: string[];
  /** Wie viele Reviews über MAX_REVIEWS hinausgingen und abgeschnitten wurden. */
  abgeschnitten: number;
  /** Was aus welcher Quelle gekommen ist — für die Anzeige über der Vorschau. */
  jeQuelle: { art: QuellenArt; gelesen: number }[];
};

export class VorschauFehler extends Error {}

/**
 * Baut aus Rohtext die komplette Gratis-Vorschau — ohne Serverkontakt.
 * Wirft VorschauFehler mit einer Meldung, die direkt anzeigbar ist.
 */
/** Liest eine einzelne Quelle ein und stempelt die Herkunft auf. */
function eingabeLesen(e: QuellenEingabe, index: number): { reviews: RawReview[]; warnungen: string[] } {
  const istCsv = /^[^\n]*[;,][^\n]*\n/.test(e.inhalt.slice(0, 2000));
  let res: { reviews: RawReview[]; warnings?: string[]; warnungen?: string[] };

  switch (e.art) {
    case "helpdesk":  res = parseHelpdeskCsv(e.inhalt); break;
    case "postfach":  res = parsePostfach(e.inhalt); break;
    case "kommentare": res = parseKommentare(e.inhalt); break;
    default:          res = istCsv ? parseReviewsCsv(e.inhalt) : parsePastedText(e.inhalt);
  }

  const quelle = QUELLEN_ARTEN.find((q) => q.art === e.art)?.quelle ?? "bewertung";
  return {
    // IDs je Quelle eindeutig halten, sonst ueberschreiben sich die Tags.
    reviews: res.reviews.map((r) => ({ ...r, id: `q${index}_${r.id}`, quelle: r.quelle ?? quelle })),
    warnungen: res.warnungen ?? res.warnings ?? [],
  };
}

export function vorschauBauen(args: {
  /** Neu: beliebig viele Quellen. */
  eingaben?: QuellenEingabe[];
  /** Altweg, weiterhin unterstützt: eine Bewertungsdatei oder eingefügter Text. */
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
  const { brandName, category, texte } = args;

  const eingaben: QuellenEingabe[] = args.eingaben?.length
    ? args.eingaben
    : [{ art: "bewertungen", inhalt: args.csv ?? args.eingefuegt ?? "" }];

  const alle: RawReview[] = [];
  const warnungen: string[] = [];
  const jeQuelle: { art: QuellenArt; gelesen: number }[] = [];

  eingaben.forEach((e, i) => {
    const { reviews, warnungen: w } = eingabeLesen(e, i);
    alle.push(...reviews);
    warnungen.push(...w);
    jeQuelle.push({ art: e.art, gelesen: reviews.length });
  });

  const parsed = { reviews: alle, warnings: warnungen };
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
      quelle: r.quelle,
    })),
    cleanStats: stats,
    warnungen: parsed.warnings,
    abgeschnitten,
    jeQuelle,
  };
}
