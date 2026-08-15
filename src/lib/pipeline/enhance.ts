import { z } from "zod";
import { ReportData } from "./types";

// Ein einziger LLM-Call NACH der Aggregation: macht aus Theme-Labels
// Angle-Titel in Kundensprache + bessere Hooks. Zahlen bleiben unangetastet.

const EnhanceSchema = z.object({
  angles: z.array(z.object({
    theme: z.string(),
    title: z.string().max(90),
    hooks: z.array(z.string().max(140)).min(2).max(4),
  })),
});

const SYSTEM = `Du formulierst Ad-Angles aus Voice-of-Customer-Daten. Regeln:
- Angle-Titel: die Kernaussage in Kundensprache, konkret und bildhaft, kein Marketing-Sprech, max 10 Worte. Nutze die Belegzitate als Rohmaterial.
- Hooks: 3 Stück pro Angle, erste Zeile einer Ad. Muster: Erleichterung ("Endlich..."), Wechsel ("nie wieder..."), Objection-Flip, Sensorik-Anker, Triple-Negative ("Kratzt nicht. Drückt nicht. ...").
- Keine Superlative ohne Beleg, keine verbotenen Claims (klimaneutral, plastikfrei, Made in Germany, Siegel), kein Ausrufezeichen-Spam, max 1 Emoji insgesamt.
- Deutsch, Du-Form. Antworte NUR mit JSON.`;

export async function enhanceReport(report: ReportData): Promise<ReportData> {
  if (!process.env.ANTHROPIC_API_KEY) return report;
  try {
    const mod = await import("@anthropic-ai/sdk");
    const client = new mod.default();
    const payload = report.angles.map((a) => ({
      theme: a.theme,
      aktuellerTitel: a.title,
      mentions: a.mentions,
      positivPct: a.positivePct,
      zitate: a.quotes.map((q) => q.text).slice(0, 5),
    }));
    const resp = await client.messages.create({
      model: process.env.ENHANCE_MODEL || "claude-sonnet-4-5",
      max_tokens: 3000,
      system: SYSTEM,
      messages: [{
        role: "user",
        content: `Marke: ${report.brandName} · Kategorie: ${report.category}\nFormuliere Titel + 3 Hooks je Angle. Antworte als {"angles":[{"theme":...,"title":...,"hooks":[...]}]}:\n${JSON.stringify(payload)}`,
      }],
    });
    const text = resp.content.find((c: { type: string }) => c.type === "text") as { text: string } | undefined;
    const raw = text?.text ?? "";
    const parsed = EnhanceSchema.parse(JSON.parse(raw.slice(raw.indexOf("{"), raw.lastIndexOf("}") + 1)));
    const byTheme = new Map(parsed.angles.map((a) => [a.theme, a]));
    return {
      ...report,
      angles: report.angles.map((a) => {
        const e = byTheme.get(a.theme);
        return e ? { ...a, title: e.title, hooks: e.hooks } : a;
      }),
      llmEnhanced: true,
    };
  } catch {
    return report; // Enhancement ist optional — Report bleibt gültig
  }
}
