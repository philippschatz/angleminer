// Zentrale Typen + Taxonomie der Pipeline.
// Regel: Das LLM taggt EINZELNE Reviews. Alles Zählen/Ranken passiert deterministisch in Code.

export type RawReview = {
  id: string;
  body: string;
  title?: string;
  rating?: number; // 1..5
  date?: string; // ISO
  author?: string;
  product?: string;
  source?: string; // judge.me, yotpo, ...
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
  taggedBy: "llm" | "heuristik";
  llmEnhanced: boolean;
};

export type ReportStatus = "preview" | "processing" | "ready";

export type StoredReport = {
  id: string;
  status: ReportStatus;
  paid: boolean;
  email?: string;
  data: ReportData;
  // Roh-Reviews behalten wir bis zum LLM-Upgrade, danach löschen (Datensparsamkeit)
  rawReviews?: RawReview[];
  createdAt: string;
};
