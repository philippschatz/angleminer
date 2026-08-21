// Seedet den Beispiel-Report unter /r/demo — aus allen drei Quellen.
// Aufruf: npx tsx scripts/seed-demo.ts
// Gegen Produktion: DATABASE_URL=<prod> npx tsx scripts/seed-demo.ts
import { readFileSync, writeFileSync } from "fs";
import { vorschauBauen } from "../src/lib/pipeline/browser";
import { llmTag } from "../src/lib/pipeline/tagger-llm";
import { heuristicTag } from "../src/lib/pipeline/tagger";
import { buildReport } from "../src/lib/pipeline/aggregate";
import { enhanceReport } from "../src/lib/pipeline/enhance";
import { saveReport } from "../src/lib/store";
import { fehler } from "../src/content/copy";
import { RawReview } from "../src/lib/pipeline/types";

const lese = (n: string) => readFileSync(new URL(`../demo/${n}`, import.meta.url), "utf8");

async function main() {
  const v = vorschauBauen({
    eingaben: [
      { art: "bewertungen", inhalt: lese("merle-reviews.csv") },
      { art: "helpdesk", inhalt: lese("merle-support.csv") },
      { art: "kommentare", inhalt: lese("merle-kommentare.txt") },
    ],
    brandName: "MERLE Bodywear",
    category: "Wäsche / DTC",
    texte: {
      keineBewertungen: fehler.keineBewertungen,
      zuWenigBewertungen: fehler.zuWenigBewertungen,
      zuVieleGefiltert: fehler.zuVieleGefiltert,
    },
  });
  console.log("gelesen:", v.jeQuelle.map((q) => `${q.art}=${q.gelesen}`).join("  "));
  console.log("nach Reinigung:", v.vorschau.totalAnalyzed);

  // Genau die Daten, die auch ein echter Kunde hochladen wuerde.
  const roh: RawReview[] = v.upload.map((u) => ({
    id: u.id, body: u.text, rating: u.rating, date: u.date, quelle: u.quelle,
  }));

  const llm = await llmTag(roh);
  const tagged = llm?.tagged ?? heuristicTag(roh);
  console.log(`getaggt via: ${llm ? `KI (${Math.round((llm.vonKi / roh.length) * 100)} %)` : "Regelwerk"}`);

  let data = buildReport({
    id: "demo", tagged, cleanStats: v.cleanStats,
    brandName: "MERLE Bodywear", category: "Wäsche / DTC", llmEnhanced: false,
  });
  data = await enhanceReport(data);

  await saveReport({
    id: "demo", status: "ready", paid: true, data,
    createdAt: new Date().toISOString(),
  });

  // Zusaetzlich als fertiges Dokument ins Repository schreiben. Damit
  // funktioniert /r/demo in jeder Umgebung sofort - ohne Datenbank, ohne
  // Seeding-Schritt beim Deployment. Nach Aenderungen an der Auswertung dieses
  // Skript erneut laufen lassen, sonst veraltet der Beispiel-Report.
  const ziel = new URL("../src/content/demo-report.ts", import.meta.url);
  writeFileSync(ziel, [
    "// ERZEUGT — nicht von Hand bearbeiten.",
    "// Neu erzeugen mit: npx tsx scripts/seed-demo.ts",
    "//",
    "// Der Beispiel-Report liegt bewusst als fertiges Dokument im Code und nicht",
    "// nur in der Datenbank: so ist /r/demo in jeder Umgebung sofort erreichbar.",
    'import { ReportData } from "@/lib/pipeline/types";',
    "",
    `export const demoReport: ReportData = ${JSON.stringify(data, null, 1)};`,
    "",
  ].join("\n"));
  console.log("geschrieben: src/content/demo-report.ts");

  console.log("\ngespeichert unter /r/demo");
  console.log(`  ${data.angles.length} Angles · ${data.objections.length} Einwände · ${data.scrollstoppers.length} Scrollstopper`);
  console.log(`  ${data.quellenluecken?.length ?? 0} Quellenlücken`);
  for (const l of data.quellenluecken ?? []) {
    console.log(`    ${l.theme}: +${l.mehrAlsBewertungen} Punkte in ${l.auffaelligste}`);
  }
  process.exit(0);
}
main().catch((e) => { console.error(e); process.exit(1); });
