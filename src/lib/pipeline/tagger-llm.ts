import { z } from "zod";
import { RawReview, ReviewTags, TaggedReview, THEMES } from "./types";
import { complianceFlagsFor, heuristicTagOne } from "./tagger";

// NUR SERVERSEITIG. Liegt bewusst getrennt von tagger.ts, damit der Browser
// beim Vorschau-Rechnen nicht das Anthropic-SDK mitladen muss.
//
// Der eigentliche Modellaufruf steckt in callModel() — eine dünne Schicht, damit
// ein späterer Wechsel (z.B. auf Bedrock in der EU) nur diese Funktion betrifft.

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

const BATCH_SIZE = 40;
const CONCURRENCY = 4;

/** Einziger Ort, an dem das Modell angesprochen wird. Rückgabe: reiner Text. */
async function callModel(system: string, user: string, maxTokens: number): Promise<string> {
  const mod = await import("@anthropic-ai/sdk");
  const client = new mod.default();
  const resp = await client.messages.create({
    model: process.env.TAGGER_MODEL || "claude-haiku-4-5",
    max_tokens: maxTokens,
    system,
    messages: [{ role: "user", content: user }],
  });
  const teil = resp.content.find((c: { type: string }) => c.type === "text") as { text?: string } | undefined;
  return teil?.text ?? "";
}

export function llmVerfuegbar(): boolean {
  return !!process.env.ANTHROPIC_API_KEY;
}

async function tagBatch(batch: RawReview[]): Promise<Map<string, ReviewTags>> {
  const payload = batch.map((r) => ({
    id: r.id,
    rating: r.rating ?? null,
    text: `${r.title ? r.title + " — " : ""}${r.body}`.slice(0, 1200),
  }));
  const user = `Tagge diese ${payload.length} Reviews. Antworte als {"reviews":[{"id":...,"themes":[...],...}]}:\n${JSON.stringify(payload)}`;

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const text = await callModel(SYSTEM_PROMPT, user, 8000);
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

export type LlmTagErgebnis = {
  tagged: TaggedReview[];
  /** Wie viele Reviews die KI wirklich getaggt hat (Rest: Heuristik-Rückfall). */
  vonKi: number;
};

export async function llmTag(
  reviews: RawReview[],
  onProgress?: (done: number, total: number) => void
): Promise<LlmTagErgebnis | null> {
  if (!llmVerfuegbar()) return null;

  const batches: RawReview[][] = [];
  for (let i = 0; i < reviews.length; i += BATCH_SIZE) batches.push(reviews.slice(i, i + BATCH_SIZE));

  const results = new Map<string, ReviewTags>();
  let done = 0;
  for (let i = 0; i < batches.length; i += CONCURRENCY) {
    const slice = batches.slice(i, i + CONCURRENCY);
    const settled = await Promise.allSettled(slice.map((b) => tagBatch(b)));
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

  return {
    vonKi: results.size,
    tagged: reviews.map((r) => ({
      ...r,
      tags: results.get(r.id) ?? heuristicTagOne(r),
      complianceFlags: complianceFlagsFor(`${r.title ?? ""} ${r.body}`),
      taggedBy: "llm" as const,
    })),
  };
}
