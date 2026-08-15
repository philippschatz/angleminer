import { z } from "zod";
import {
  COMPLIANCE_PATTERNS, RawReview, ReviewTags, TaggedReview, THEMES, Theme, Sentiment,
} from "./types";

// Zwei Tagger, gleiche Schnittstelle:
// - heuristicTag: sofort, kostenlos, keyword-basiert (Preview + Fallback)
// - llmTagBatch: Anthropic, batched, zod-validiert (nach Zahlung / wenn Key gesetzt)

const THEME_KEYWORDS: Record<Theme, RegExp> = {
  passform: /passform|sitzt|sitz\b|passt (perfekt|super|gut|wie)|schnitt|eng\b|weit\b|drückt|einschneid|verrutscht|hält\b|zwickt|kneift/i,
  material_haptik: /material|stoff|weich|haptik|fühlt sich|haut\b|angenehm zu tragen|kratzt|kratzig|atmungsaktiv|baumwolle|modal|qualität des stoff|zweite haut|kuschelig|seidig/i,
  haltbarkeit: /haltbar|hält (schon|seit|ewig)|wäsche\b|waschen|gewaschen|pilling|leiert|ausgeleiert|verzogen|naht|nähte|löcher|verwaschen|langlebig|jahre/i,
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
const EMOTION_MARKERS = /endlich|liebe|hasse|nie wieder|!{2,}|beste[rn]?\b|traum|verliebt|süchtig|obsessed|gänsehaut|heulen|lache/i;
const FUNNY_HUMAN_MARKERS = /mein (mann|freund|hund|kind)|peinlich|ehrlich gesagt|kleiner tipp|störfaktor|schwöre|keine werbung|ich kaufe sonst nie|bin normalerweise|😂|🤣|haha/i;

function heuristicTagOne(r: RawReview): ReviewTags {
  const text = `${r.title ?? ""} ${r.body}`;
  const themes: Theme[] = [];
  for (const t of THEMES) {
    if (t === "sonstiges") continue;
    if (THEME_KEYWORDS[t].test(text)) themes.push(t);
    if (themes.length >= 3) break;
  }
  if (themes.length === 0) themes.push("sonstiges");

  let sentiment: Sentiment = "neutral";
  const neg = NEGATIVE_MARKERS.test(text);
  const pos = POSITIVE_MARKERS.test(text) || (r.rating !== undefined && r.rating >= 4);
  const negByRating = r.rating !== undefined && r.rating <= 2;
  if ((neg || negByRating) && pos) sentiment = "gemischt";
  else if (neg || negByRating) sentiment = "negativ";
  else if (pos) sentiment = "positiv";

  const isObjection = neg || negByRating || /aber\b|einzig|wermutstropfen|einziges manko/i.test(text);
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

// ---------- LLM-Tagger ----------

const TagSchema = z.object({
  id: z.string(),
  themes: z.array(z.enum(THEMES)).min(1).max(3),
  sentiment: z.enum(["positiv", "negativ", "gemischt", "neutral"]),
  isObjection: z.boolean(),
  objectionSummary: z.string().max(120).optional().nullable(),
  adReady: z.boolean(),
  scrollstopper: z.boolean(),
  emotion: z.number().int().min(0).max(3),
});
const BatchSchema = z.object({ reviews: z.array(TagSchema) });

const SYSTEM_PROMPT = `Du taggst Kundenbewertungen für Voice-of-Customer-Analysen (Paid-Social-Vorbereitung). Antworte NUR mit validem JSON, keinem anderen Text.

Pro Review vergibst du:
- themes: 1-3 aus [${THEMES.join(", ")}]
- sentiment: positiv | negativ | gemischt | neutral
- isObjection: true wenn die Review eine Kaufbarriere/Kritik enthält (auch in sonst positiven Reviews, z.B. "toll, ABER fällt klein aus")
- objectionSummary: falls isObjection, die Barriere in max 8 Worten Kundensprache (z.B. "fällt kleiner aus")
- adReady: true wenn das Zitat kurz, konkret, bildhaft und als Testimonial verwendbar ist (kein Gestammel, keine Interna, 30-220 Zeichen)
- scrollstopper: true wenn ungewöhnlich, sehr menschlich oder lustig (die Sorte Zitat, bei der man beim Scrollen hängen bleibt)
- emotion: 0-3 (0=sachlich, 3=stark emotional)

Sei streng bei adReady und scrollstopper: lieber wenige gute als viele mittelmäßige.`;

type AnthropicClient = {
  messages: { create: (args: Record<string, unknown>) => Promise<{ content: { type: string; text?: string }[] }> };
};

async function getClient(): Promise<AnthropicClient | null> {
  if (!process.env.ANTHROPIC_API_KEY) return null;
  const mod = await import("@anthropic-ai/sdk");
  const Anthropic = mod.default;
  return new Anthropic() as unknown as AnthropicClient;
}

const BATCH_SIZE = 40;
const CONCURRENCY = 4;
const MODEL = process.env.TAGGER_MODEL || "claude-haiku-4-5";

async function tagBatch(client: AnthropicClient, batch: RawReview[]): Promise<Map<string, ReviewTags>> {
  const payload = batch.map((r) => ({
    id: r.id,
    rating: r.rating ?? null,
    text: `${r.title ? r.title + " — " : ""}${r.body}`.slice(0, 1200),
  }));
  const user = `Tagge diese ${payload.length} Reviews. Antworte als {"reviews":[{"id":...,"themes":[...],...}]}:\n${JSON.stringify(payload)}`;

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const resp = await client.messages.create({
        model: MODEL,
        max_tokens: 8000,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: user }],
      });
      const text = resp.content.find((c) => c.type === "text")?.text ?? "";
      const jsonStr = text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1);
      const parsed = BatchSchema.parse(JSON.parse(jsonStr));
      const map = new Map<string, ReviewTags>();
      for (const t of parsed.reviews) {
        map.set(t.id, {
          themes: t.themes,
          sentiment: t.sentiment,
          isObjection: t.isObjection,
          objectionSummary: t.objectionSummary ?? undefined,
          adReady: t.adReady,
          scrollstopper: t.scrollstopper,
          emotion: t.emotion,
        });
      }
      return map;
    } catch (e) {
      if (attempt === 2) throw e;
      await new Promise((res) => setTimeout(res, 1500 * (attempt + 1)));
    }
  }
  throw new Error("unreachable");
}

export async function llmTag(reviews: RawReview[], onProgress?: (done: number, total: number) => void): Promise<TaggedReview[] | null> {
  const client = await getClient();
  if (!client) return null;

  const batches: RawReview[][] = [];
  for (let i = 0; i < reviews.length; i += BATCH_SIZE) batches.push(reviews.slice(i, i + BATCH_SIZE));

  const results = new Map<string, ReviewTags>();
  let done = 0;
  for (let i = 0; i < batches.length; i += CONCURRENCY) {
    const slice = batches.slice(i, i + CONCURRENCY);
    const settled = await Promise.allSettled(slice.map((b) => tagBatch(client, b)));
    settled.forEach((s, j) => {
      if (s.status === "fulfilled") {
        for (const [id, tags] of s.value) results.set(id, tags);
      } else {
        // Batch-Fehler: Heuristik-Fallback für genau diese Reviews
        for (const r of slice[j]) results.set(r.id, heuristicTagOne(r));
      }
      done += slice[j].length;
    });
    onProgress?.(Math.min(done, reviews.length), reviews.length);
  }

  return reviews.map((r) => ({
    ...r,
    tags: results.get(r.id) ?? heuristicTagOne(r),
    complianceFlags: complianceFlagsFor(`${r.title ?? ""} ${r.body}`),
    taggedBy: "llm" as const,
  }));
}
