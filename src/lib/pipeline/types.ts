// Zentrale Typen + Taxonomie der Pipeline.
// Regel: Das LLM taggt EINZELNE Reviews. Alles Zählen/Ranken passiert deterministisch in Code.

/**
 * Woher ein Text stammt. Der Unterschied ist inhaltlich entscheidend:
 *
 * - bewertung: oeffentlich geschrieben, oft auf eine incentivierte Mail hin,
 *   in der Honeymoon-Phase. Die freundlichste und unehrlichste Quelle.
 * - support: was Kunden schreiben, wenn etwas schiefgeht. Hier stehen die
 *   echten Kaufbarrieren, unverstellt.
 * - kommentar: unter Anzeigen und Beitraegen. Hier stehen die Fragen, die
 *   Leute VOR dem Kauf stellen - die Einwaende, bevor sie Kunden werden.
 * - mail: direkte Zuschriften ans Postfach, zwischen Support und Lob.
 */
export const QUELLEN = ["bewertung", "support", "kommentar", "mail"] as const;
export type Quelle = (typeof QUELLEN)[number];

export const QUELLE_LABELS: Record<Quelle, string> = {
  bewertung: "Bewertungen",
  support: "Support",
  kommentar: "Kommentare",
  mail: "Postfach",
};

/** Genitiv-Form fuer Saetze wie "23 % der Support-Anfragen". */
export const QUELLE_GENITIV: Record<Quelle, string> = {
  bewertung: "Bewertungen",
  support: "Support-Anfragen",
  kommentar: "Kommentare",
  mail: "Postfach-Nachrichten",
};

/** Kurzform fuer die Herkunftsmarkierung an einzelnen Zitaten. */
export const QUELLE_KURZ: Record<Quelle, string> = {
  bewertung: "Bewertung",
  support: "Support",
  kommentar: "Kommentar",
  mail: "Mail",
};

export type RawReview = {
  id: string;
  body: string;
  title?: string;
  rating?: number; // 1..5
  date?: string; // ISO
  author?: string;
  product?: string;
  source?: string; // judge.me, yotpo, gorgias, ...
  /** Art der Quelle. Fehlt sie, wird "bewertung" angenommen (Altdaten). */
  quelle?: Quelle;
};

export const THEMES = [
  "passform",
  "material_haptik",
  "haltbarkeit",
  "preis_wert",
  "optik_design",
  "funktion_alltag",
  "service_versand",
  "groesse_erwartung",
  "nachhaltigkeit",
  "geschenk_anlass",
  "sonstiges",
] as const;
export type Theme = (typeof THEMES)[number];

export const THEME_LABELS: Record<Theme, string> = {
  passform: "Passform & Sitz",
  material_haptik: "Material & Haptik",
  haltbarkeit: "Haltbarkeit & Qualität",
  preis_wert: "Preis & Wert",
  optik_design: "Optik & Design",
  funktion_alltag: "Funktion im Alltag",
  service_versand: "Service & Versand",
  groesse_erwartung: "Größe & Erwartung",
  nachhaltigkeit: "Nachhaltigkeit",
  geschenk_anlass: "Geschenk & Anlass",
  sonstiges: "Sonstiges",
};

export type Sentiment = "positiv" | "negativ" | "gemischt" | "neutral";

// Rechtlich/markenseitig heikle Claims in Kundenzitaten – nur flaggen, nie verwenden.
export const COMPLIANCE_PATTERNS: { flag: string; re: RegExp }[] = [
  { flag: "klimaneutral", re: /klima\s*-?\s*neutral|co2\s*-?\s*neutral/i },
  { flag: "plastikfrei", re: /plastikfrei|mikroplastik/i },
  { flag: "made_in_germany", re: /made\s+in\s+germany|aus\s+deutschland/i },
  { flag: "siegel", re: /\bgots\b|fair\s*trade|fairtrade|bluesign|grüner\s+knopf|oeko\s*-?\s*tex/i },
  { flag: "absolut_claim", re: /100\s*%\s*(nachhaltig|öko|bio)|komplett\s+nachhaltig/i },
  { flag: "heilversprechen", re: /heilt|lindert\s+schmerzen|gegen\s+krankheit|medizinisch/i },
];

export type ReviewTags = {
  themes: Theme[]; // 1..3
  sentiment: Sentiment;
  isObjection: boolean; // enthält Kaufbarriere / Kritikpunkt
  objectionSummary?: string; // kurz, in Kundensprache
  adReady: boolean; // kurz, bildhaft, als Zitat verwendbar
  scrollstopper: boolean; // ungewöhnlich, menschlich, lustig
  emotion: number; // 0..3 Intensität
};

export type TaggedReview = RawReview & {
  tags: ReviewTags;
  complianceFlags: string[];
  taggedBy: "llm" | "heuristik";
};

export type CleanStats = {
  input: number;
  kept: number;
  duplicates: number;
  junk: number;
  piiScrubbed: number;
  seedingAlert: { body: string; count: number }[] | null;
};

export type Quote = {
  text: string;
  author?: string;
  date?: string;
  rating?: number;
  source?: string;
  quelle?: Quelle;
  complianceFlags: string[];
};

export type Angle = {
  title: string; // Kernaussage in Kundensprache
  theme: Theme;
  mentions: number;
  sharePct: number;
  positivePct: number;
  trend: "steigend" | "stabil" | "fallend" | "unklar";
  quotes: Quote[];
  hooks: string[];
  score: number;
};

export type Objection = {
  summary: string;
  mentions: number;
  quotes: Quote[]; // Belege der Objection
  counterQuotes: Quote[]; // positive Gegenbelege
};

export type WordEntry = { word: string; count: number };

/**
 * Ein Thema, das in einer Quelle deutlich anders aussieht als in einer anderen.
 *
 * Das ist der Grund, mehrere Quellen anzubinden: Bewertungen loben die Passform,
 * waehrend im Support jeden Tag jemand nach Groessen fragt. Diese Luecke sieht
 * man in keiner der beiden Quellen allein.
 */
export type Quellenluecke = {
  theme: Theme;
  /** Je Quelle: Nennungen, Anteil an dieser Quelle, Positivanteil. */
  jeQuelle: { quelle: Quelle; nennungen: number; anteilPct: number; positivPct: number }[];
  /**
   * Um wie viele Prozentpunkte das Thema in der auffaelligsten Quelle mehr Raum
   * einnimmt als in den Bewertungen.
   *
   * Bewusst ein Vergleich von ANTEILEN, nicht von Stimmungswerten. Support und
   * Kommentare sind naturgemaess kritisch - niemand schreibt den Support an, um
   * zu loben. Ein Stimmungsvergleich zwischen einem Lob- und einem
   * Beschwerdekanal ergibt immer einen Riesenabstand und sagt nichts. Wie viel
   * Raum ein Thema einnimmt, ist dagegen vergleichbar.
   */
  mehrAlsBewertungen: number;
  /** Quelle, in der das Thema am meisten Raum einnimmt. */
  auffaelligste: Quelle;
  /** Belege aus der auffaelligsten Quelle. */
  quotes: Quote[];
};

export type ReportData = {
  id: string;
  createdAt: string;
  brandName: string;
  category: string;
  email?: string;
  cleanStats: CleanStats;
  totalAnalyzed: number;
  ratingAvg: number | null;
  sentimentSplit: Record<Sentiment, number>;
  themeCounts: { theme: Theme; count: number; positivePct: number }[];
  angles: Angle[];
  objections: Objection[];
  scrollstoppers: Quote[];
  wording: { kunden: WordEntry[]; };
  /**
   * Wie viele Texte je Quelle eingegangen sind — und wie positiv diese Quelle
   * insgesamt ist. Der Grundwert ist wichtig fuer die Einordnung: 8 % positiv
   * im Support ist normal, nicht alarmierend.
   */
  quellenSplit?: { quelle: Quelle; count: number; positivPct: number }[];
  /** Themen, die je Quelle deutlich anders aussehen. Nur bei mehreren Quellen. */
  quellenluecken?: Quellenluecke[];
  taggedBy: "llm" | "heuristik";
  llmEnhanced: boolean;
};

export type ReportStatus = "preview" | "processing" | "ready";

/** Fortschritt der gechunkten Tiefenanalyse. Überlebt einen Funktions-Timeout. */
export type Fortschritt = {
  erledigt: number;
  gesamt: number;
  /** Tags der bereits verarbeiteten Reviews, nach Review-ID. */
  tags: Record<string, ReviewTags>;
  /** Wie viele davon wirklich von der KI kamen (Rest: Regelwerk-Rückfall). */
  vonKi: number;
  /** Zeitstempel des letzten Fortschritts — erkennt haengengebliebene Jobs. */
  zuletzt: string;
};

export type StoredReport = {
  id: string;
  status: ReportStatus;
  paid: boolean;
  email?: string;
  data: ReportData;
  // Roh-Reviews behalten wir bis zum LLM-Upgrade, danach löschen (Datensparsamkeit)
  rawReviews?: RawReview[];
  createdAt: string;

  /** Konto, dem der Report gehört. Entsteht mit der Zahlung. */
  ownerEmail?: string;
  /** Für Erstattungen gebraucht. */
  stripeSessionId?: string;
  /** Automatisch erstattet, weil die Tiefenanalyse groesstenteils ausfiel. */
  refunded?: boolean;
  /** Anteil der Reviews, die wirklich die KI gesehen hat (0..1). */
  kiAnteil?: number;
  fortschritt?: Fortschritt;
  /** Gesetzt, sobald Zitate und Texte nach Ablauf entfernt wurden. Die Zahlen bleiben. */
  zitateGeloeschtAm?: string;
};

export type Konto = {
  email: string;
  createdAt: string;
  /** Letzter Login — Grundlage für die 24-Monats-Frist. */
  lastSeenAt: string;
};
