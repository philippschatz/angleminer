import {
  COMPLIANCE_PATTERNS, RawReview, ReviewTags, TaggedReview, THEMES, Theme, Sentiment,
} from "./types";

// Regelbasierter Tagger: sofort, kostenlos, keyword-basiert.
// Läuft im Browser (Gratis-Vorschau) und serverseitig als Rückfallebene.
// Der KI-Tagger liegt getrennt in tagger-llm.ts, damit der Browser das
// Anthropic-SDK nicht mitladen muss.

const THEME_KEYWORDS: Record<Theme, RegExp> = {
  passform: /passform|sitzt|sitz\b|passt (perfekt|super|gut|wie)|schnitt|eng\b|weit\b|drückt|einschneid|verrutscht|hält\b|zwickt|kneift/i,
  material_haptik: /material|stoff|weich|haptik|fühlt sich|\bhaut\b|angenehm zu tragen|kratzt|kratzig|atmungsaktiv|baumwolle|modal|qualität des stoff|zweite haut|kuschelig|seidig/i,
  haltbarkeit: /haltbar|hält (schon|seit|ewig)|\bwäsche\b|waschen|gewaschen|pilling|leiert|ausgeleiert|verzogen|naht|nähte|löcher|verwaschen|langlebig|jahre/i,
  preis_wert: /preis|teuer|günstig|wert\b|preis-leistung|kostet|euro|investition|lohnt sich|jeden cent/i,
  optik_design: /schön|design|farbe|optik|aussehen|sieht (gut|toll|super)|hübsch|elegant|schlicht|spitze\b|sexy|stylisch/i,
  funktion_alltag: /alltag|büro|sport|unterm?\s|trägt (sich|nicht) auf|zeichnet sich|unsichtbar|ab\b.*unter|den ganzen tag|vergesse|spüre? (sie|ihn|es) (gar )?nicht/i,
  service_versand: /versand|lieferung|geliefert|retoure|umtausch|kundenservice|support|verpackung|antwort|reklamation/i,
  groesse_erwartung: /größe|fällt (kleiner|größer|normal) aus|nummer (größer|kleiner)|größentabelle|bestellt.*größe|zu klein|zu groß/i,
  nachhaltigkeit: /nachhaltig|umwelt|öko|bio\b|fair\b|gewissen|verantwortung|plastikfrei|klimaneutral/i,
  geschenk_anlass: /geschenk|geschenkt|verschenk|freundin|frau\b|mann\b.*geschenk|weihnachten|geburtstag/i,
  sonstiges: /$^/,
};

const NEGATIVE_MARKERS = /leider|enttäusch|schade|nicht (gut|schön|zufrieden|empfehlen)|zurückgeschickt|retoure|kaputt|schlecht|nie wieder|ärger|mangel|defekt|kratzt|drückt|zwickt|leiert|zu (klein|groß|teuer|eng)/i;
const POSITIVE_MARKERS = /super|toll|perfekt|liebe|begeistert|empfehl|klasse|wunderbar|endlich|genial|traumhaft|hervorragend|bester?\b|nie wieder was anderes|immer wieder/i;
const EMOTION_MARKERS = /\bendlich\b|\bliebe\b|\bhasse\b|\bnie wieder\b|!{2,}|\bbeste[rn]?\b|\btraum\b|\bverliebt\b|\bsüchtig\b|\bobsessed\b|\bgänsehaut\b|\bheulen\b|\blache\b/i;
const FUNNY_HUMAN_MARKERS = /mein (mann|freund|hund|kind)|peinlich|ehrlich gesagt|kleiner tipp|störfaktor|schwöre|keine werbung|ich kaufe sonst nie|bin normalerweise|😂|🤣|haha/i;

// Woerter, die fuer sich negativ klingen, in der Verneinung aber das Gegenteil
// bedeuten: "zwickt nirgends", "nichts drueckt", "nichts leiert".
const MAENGEL = "zwickt|drückt|kratzt|leiert|einschneidet|einschneiden|verrutscht|rutscht|schneidet|kneift|piekst|piekt|scheuert|kratzen|drücken";
const VERNEINT_VOR = new RegExp(`\\b(nichts|nirgends|nirgend|kein|keine|keinen|keinem|nicht)\\s+(\\w+\\s+)?(${MAENGEL})\\b`, "gi");
const VERNEINT_NACH = new RegExp(`\\b(${MAENGEL})\\s+(nichts|nirgends|nirgend|nie|nicht)\\b`, "gi");

/** Entfernt verneinte Mangel-Aussagen, damit sie nicht als Kritik zaehlen. */
function ohneVerneintes(text: string): string {
  return text.replace(VERNEINT_VOR, " ").replace(VERNEINT_NACH, " ");
}

export function heuristicTagOne(r: RawReview): ReviewTags {
  const text = `${r.title ?? ""} ${r.body}`;
  const themes: Theme[] = [];
  for (const t of THEMES) {
    if (t === "sonstiges") continue;
    if (THEME_KEYWORDS[t].test(text)) themes.push(t);
    if (themes.length >= 3) break;
  }
  if (themes.length === 0) themes.push("sonstiges");

  let sentiment: Sentiment = "neutral";
  const textOhneVerneintes = ohneVerneintes(text);
  const neg = NEGATIVE_MARKERS.test(textOhneVerneintes);
  const pos = POSITIVE_MARKERS.test(text) || (r.rating !== undefined && r.rating >= 4);
  const negByRating = r.rating !== undefined && r.rating <= 2;
  if ((neg || negByRating) && pos) sentiment = "gemischt";
  else if (neg || negByRating) sentiment = "negativ";
  else if (pos) sentiment = "positiv";

  const isObjection = neg || negByRating || /aber\b|einzig|wermutstropfen|einziges manko/i.test(textOhneVerneintes);
  const len = r.body.length;
  const adReady = sentiment === "positiv" && len >= 30 && len <= 220 && !/\[.+entfernt\]/.test(r.body);
  const emotion = Math.min(3, (EMOTION_MARKERS.test(text) ? 2 : 0) + (/!{1,}/.test(text) ? 1 : 0));
  const scrollstopper = FUNNY_HUMAN_MARKERS.test(text) && len <= 300;

  return {
    themes,
    sentiment,
    isObjection,
    objectionSummary: isObjection ? undefined : undefined,
    adReady,
    scrollstopper,
    emotion,
  };
}

export function complianceFlagsFor(body: string): string[] {
  const flags: string[] = [];
  for (const { flag, re } of COMPLIANCE_PATTERNS) {
    if (re.test(body)) flags.push(flag);
  }
  return flags;
}

export function heuristicTag(reviews: RawReview[]): TaggedReview[] {
  return reviews.map((r) => ({
    ...r,
    tags: heuristicTagOne(r),
    complianceFlags: complianceFlagsFor(`${r.title ?? ""} ${r.body}`),
    taggedBy: "heuristik" as const,
  }));
}
