import {
  Angle, CleanStats, Objection, Quote, ReportData, Sentiment, TaggedReview, THEME_LABELS, THEMES, Theme, WordEntry,
} from "./types";

// Alles hier ist deterministisch. Kein LLM zählt, rankt oder erfindet Zahlen.

const STOPWORDS = new Set(("aber alle allem allen aller alles als also am an andere anderen anderer anderes auch auf aus bei bin bis bist da damit dann das dass dazu dein deine dem den denn der des dessen dich die dies diese diesem diesen dieser dieses dir doch dort du durch ein eine einem einen einer eines einfach er es etwas euch euer eure für gegen gewesen hab habe haben hat hatte hatten hier hin hinter ich ihm ihn ihnen ihr ihre im in indem ins ist ja jede jedem jeden jeder jedes jetzt kann kein keine keinem keinen keiner keines können könnte machen man manche mein meine mich mir mit muss musste nach nicht nichts noch nun nur ob oder ohne sehr sein seine sich sie sind so solche soll sollte sondern sonst über um und uns unser unter vom von vor war waren was weil weiter wenn wer werde werden wie wieder will wir wird wirst wo wurde würde zu zum zur zwar mal schon ganz gar mehr immer bin bekommen echt halt eben genau gerne total wirklich absolut super toll gut schön find finde ich's hab's beim zwei drei vier mein meinem meine meiner wollte wollen sieht sehen teil teile ganze ganzen andere anderen wieder etwas seit dann noch nach jetzt beide bisher deshalb sowie dabei davon dazu damit").split(" "));

function wordLexicon(reviews: TaggedReview[], top = 30): WordEntry[] {
  const counts = new Map<string, number>();
  for (const r of reviews) {
    const words = r.body.toLowerCase().replace(/[^\p{L}\p{N}\s-]/gu, " ").split(/\s+/);
    const seen = new Set<string>();
    for (const w of words) {
      if (w.length < 4 || STOPWORDS.has(w) || seen.has(w)) continue;
      seen.add(w);
      counts.set(w, (counts.get(w) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, top)
    .map(([word, count]) => ({ word, count }));
}

// Diversität bei der Zitat-Auswahl: keine Fast-Duplikate nebeneinander
function wordSet(s: string): Set<string> {
  return new Set(s.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, " ").split(/\s+/).filter((w) => w.length > 3));
}
function similar(a: string, b: string): boolean {
  const wa = wordSet(a);
  const wb = wordSet(b);
  if (wa.size === 0 || wb.size === 0) return false;
  let inter = 0;
  for (const w of wa) if (wb.has(w)) inter++;
  return inter / Math.min(wa.size, wb.size) > 0.6;
}
function pickDiverse(candidates: TaggedReview[], n: number): TaggedReview[] {
  const picked: TaggedReview[] = [];
  for (const c of candidates) {
    if (picked.length >= n) break;
    if (picked.some((p) => similar(p.body, c.body))) continue;
    picked.push(c);
  }
  // Auffüllen, falls der Diversitäts-Filter zu streng war
  for (const c of candidates) {
    if (picked.length >= n) break;
    if (!picked.includes(c)) picked.push(c);
  }
  return picked;
}

/**
 * Wie brauchbar ist dieses Zitat fuer ein Ad-Briefing?
 *
 * Vorher wurde nach kuerzester Laenge sortiert - dadurch gewannen generische
 * Einzeiler ("Super Qualitaet, tolle Passform") gegen konkrete Schilderungen
 * ("Ich habe 75B und finde nie was, das ohne Buegel haelt"). Fuer ein Briefing
 * ist das genau falsch: Der Wert eines Zitats steckt im Konkreten.
 *
 * Alles hier ist deterministisch - kein Modell entscheidet, was ein gutes
 * Zitat ist.
 */
const KONKRET = /\b(endlich|statt|vorher|sonst|trotzdem|obwohl|zum ersten mal|seit|nach \d|weil)\b/i;

function zitatGuete(r: TaggedReview): number {
  const len = r.body.length;
  let s = r.tags.emotion * 2;
  if (len >= 60 && len <= 240) s += 3;      // die brauchbare Spanne
  if (len < 45) s -= 4;                      // zu generisch, um zu tragen
  if (/\d/.test(r.body)) s += 2;             // Groessen, Waschzahlen, Zeitraeume
  if (KONKRET.test(r.body)) s += 2;          // Kontrast, Vorgeschichte, Wendepunkt
  return s;
}

function toQuote(r: TaggedReview): Quote {
  return {
    text: r.body.length > 280 ? r.body.slice(0, 277) + "…" : r.body,
    author: r.author,
    date: r.date,
    rating: r.rating,
    source: r.source,
    complianceFlags: r.complianceFlags,
  };
}

function trendFor(reviews: TaggedReview[], all: TaggedReview[]): Angle["trend"] {
  const dated = reviews.filter((r) => r.date);
  const allDated = all.filter((r) => r.date);
  // Unter diesen Schwellen ist ein "Trend" statistisches Rauschen. Lieber
  // "unklar" ausweisen als eine Richtung behaupten, die niemand nachrechnen kann.
  if (dated.length < 15 || allDated.length < 60) return "unklar";
  const dates = allDated.map((r) => Date.parse(r.date!)).sort((a, b) => a - b);
  const t0 = dates[0];
  const t1 = dates[dates.length - 1];
  if (t1 - t0 < 1000 * 60 * 60 * 24 * 60) return "unklar"; // < 2 Monate Spanne
  const mid = t0 + (t1 - t0) / 2;

  // Bewusst absolute Haeufigkeit je Zeithaelfte, nicht der Anteil am Gesamt.
  // Mit Anteilen wuerde jedes Thema "fallend" heissen, sobald ein anderes stark
  // zulegt - obwohl seine Nennungen gleich geblieben sind. Ein Kunde liest
  // "fallend" aber als Rueckgang, nicht als Verschiebung.
  const frueh = dated.filter((r) => Date.parse(r.date!) < mid).length;
  const spaet = dated.length - frueh;
  if (frueh < 5 || spaet < 5) return "unklar";
  if (spaet > frueh * 1.4) return "steigend";
  if (spaet < frueh * 0.65) return "fallend";
  return "stabil";
}

// Fallback-Hooks aus Templates + echtem Zitat (werden im LLM-Schritt ersetzt)
function templateHooks(theme: Theme, topQuote?: Quote): string[] {
  const q = topQuote ? `„${topQuote.text.slice(0, 80)}${topQuote.text.length > 80 ? "…" : ""}"` : null;
  const base: Record<Theme, string[]> = {
    passform: ["Endlich eine Passform, über die Kundinnen von selbst schreiben.", "Sitzt. Den ganzen Tag. Sagen nicht wir — sagen die Reviews."],
    material_haptik: ["Das Erste, was Kunden erwähnen: wie es sich anfühlt.", "Zweite Haut ist ein Kundenzitat, kein Marketing-Sprech."],
    haltbarkeit: ["Nach 50 Wäschen noch im Einsatz — laut den Leuten, die es wissen müssen.", "Qualität, die in Reviews mit Monaten und Jahren belegt wird."],
    preis_wert: ["Teurer als im Discounter. Und trotzdem kaufen sie wieder. Warum?", "Was Kunden über den Preis sagen, wenn man sie nicht fragt."],
    optik_design: ["Gekauft wegen der Optik. Wiedergekauft wegen allem anderen.", "Das Design, das in Reviews am häufigsten genannt wird."],
    funktion_alltag: ["Trägt sich so, dass man es abends vergisst auszuziehen.", "Der Alltagstest, den keine Produktseite ersetzen kann."],
    service_versand: ["Auch dafür gibt es Kundenstimmen: Service, der erwähnt wird.", "Wenn selbst die Retoure gelobt wird."],
    groesse_erwartung: ["Fällt es kleiner aus? Das sagen Käufer wirklich.", "Die Größenfrage — beantwortet von Leuten, die bestellt haben."],
    nachhaltigkeit: ["Warum Kunden bleiben, nachdem sie wegen Nachhaltigkeit kamen.", "Gewissen ist der Einstieg. Komfort ist der Grund fürs Wiederkommen."],
    geschenk_anlass: ["Das Geschenk, das laut Reviews wirklich ankommt.", "Verschenkt. Und dann selbst nachbestellt."],
    sonstiges: ["Was Kunden sonst noch bewegt.", "Die Stimmen zwischen den Kategorien."],
  };
  const hooks = [...base[theme]];
  if (q) hooks.push(q);
  return hooks.slice(0, 3);
}

export function buildReport(args: {
  id: string;
  tagged: TaggedReview[];
  cleanStats: CleanStats;
  brandName: string;
  category: string;
  email?: string;
  llmEnhanced: boolean;
}): ReportData {
  const { id, tagged, cleanStats, brandName, category, email, llmEnhanced } = args;

  const sentimentSplit: Record<Sentiment, number> = { positiv: 0, negativ: 0, gemischt: 0, neutral: 0 };
  for (const r of tagged) sentimentSplit[r.tags.sentiment]++;

  const rated = tagged.filter((r) => r.rating !== undefined);
  const ratingAvg = rated.length > 0 ? Math.round((rated.reduce((a, r) => a + (r.rating ?? 0), 0) / rated.length) * 100) / 100 : null;

  // Theme-Zählung
  const themeCounts = THEMES.map((theme) => {
    const rs = tagged.filter((r) => r.tags.themes.includes(theme));
    const pos = rs.filter((r) => r.tags.sentiment === "positiv").length;
    return {
      theme,
      count: rs.length,
      positivePct: rs.length > 0 ? Math.round((pos / rs.length) * 100) : 0,
    };
  }).filter((t) => t.count > 0).sort((a, b) => b.count - a.count);

  // Angles: pro Theme mit genug Substanz
  const MIN_MENTIONS = Math.max(5, Math.round(tagged.length * 0.02));
  const angles: Angle[] = [];
  for (const tc of themeCounts) {
    if (tc.theme === "sonstiges" || tc.theme === "service_versand") continue;
    if (tc.count < MIN_MENTIONS) continue;
    const rs = tagged.filter((r) => r.tags.themes.includes(tc.theme));
    const positives = rs.filter((r) => r.tags.sentiment === "positiv");
    const avgEmotion = rs.reduce((a, r) => a + r.tags.emotion, 0) / rs.length;
    // Zitate, deren erstes (staerkstes) Thema dieses Thema ist, zaehlen zuerst.
    // Sonst landen unter "Haltbarkeit" Zitate, die eigentlich von der Passform
    // erzaehlen und das Thema nur am Rand beruehren.
    const nachGuete = (a: TaggedReview, b: TaggedReview) => zitatGuete(b) - zitatGuete(a);
    const passend = positives.filter((r) => r.tags.adReady);
    const adReadyCandidates = [
      ...passend.filter((r) => r.tags.themes[0] === tc.theme).sort(nachGuete),
      ...passend.filter((r) => r.tags.themes[0] !== tc.theme).sort(nachGuete),
    ];
    const adReadyQuotes = pickDiverse(adReadyCandidates, 5).map(toQuote);
    // Score: Häufigkeit × Emotionalität × Ad-Eignung
    const score = tc.count * (1 + avgEmotion) * (adReadyQuotes.length > 0 ? 1.5 : 0.6);
    angles.push({
      title: THEME_LABELS[tc.theme],
      theme: tc.theme,
      mentions: tc.count,
      sharePct: Math.round((tc.count / tagged.length) * 100),
      positivePct: tc.positivePct,
      trend: trendFor(rs, tagged),
      quotes: adReadyQuotes,
      hooks: templateHooks(tc.theme, adReadyQuotes[0]),
      score: Math.round(score),
    });
  }
  angles.sort((a, b) => b.score - a.score);

  // Objection-Bank: gruppiert nach objectionSummary (LLM) oder Theme (Heuristik)
  const objectionReviews = tagged.filter((r) => r.tags.isObjection);
  const objGroups = new Map<string, TaggedReview[]>();
  for (const r of objectionReviews) {
    const key = r.tags.objectionSummary?.toLowerCase().trim() ||
      `Kritik: ${THEME_LABELS[r.tags.themes[0]]}`;
    const arr = objGroups.get(key) ?? [];
    arr.push(r);
    objGroups.set(key, arr);
  }
  const objections: Objection[] = [...objGroups.entries()]
    .filter(([, rs]) => rs.length >= 2)
    .sort((a, b) => b[1].length - a[1].length)
    .slice(0, 8)
    .map(([summary, rs]) => {
      const theme = rs[0].tags.themes[0];
      const counters = pickDiverse(
        tagged
          .filter((r) => r.tags.sentiment === "positiv" && r.tags.adReady && r.tags.themes.includes(theme) && !r.tags.isObjection)
          .sort((a, b) => zitatGuete(b) - zitatGuete(a)),
        3
      ).map(toQuote);
      return {
        summary: summary.charAt(0).toUpperCase() + summary.slice(1),
        mentions: rs.length,
        quotes: rs.slice(0, 3).map(toQuote),
        counterQuotes: counters,
      };
    });

  // Scrollstopper
  const scrollstoppers = tagged
    .filter((r) => r.tags.scrollstopper)
    .sort((a, b) => zitatGuete(b) - zitatGuete(a))
    .slice(0, 15)
    .map(toQuote);

  return {
    id,
    createdAt: new Date().toISOString(),
    brandName,
    category,
    email,
    cleanStats,
    totalAnalyzed: tagged.length,
    ratingAvg,
    sentimentSplit,
    themeCounts,
    angles: angles.slice(0, 10),
    objections,
    scrollstoppers,
    wording: { kunden: wordLexicon(tagged) },
    taggedBy: tagged[0]?.taggedBy ?? "heuristik",
    llmEnhanced,
  };
}
