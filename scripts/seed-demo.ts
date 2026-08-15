// Seedet den öffentlichen Beispiel-Report unter /r/demo aus demo/merle-reviews.csv.
// Aufruf: npx tsx scripts/seed-demo.ts
import { readFileSync } from "fs";
import { parseReviewsCsv } from "../src/lib/pipeline/parse";
import { cleanReviews } from "../src/lib/pipeline/clean";
import { heuristicTag } from "../src/lib/pipeline/tagger";
import { llmTag } from "../src/lib/pipeline/tagger-llm";
import { buildReport } from "../src/lib/pipeline/aggregate";
import { enhanceReport } from "../src/lib/pipeline/enhance";
import { saveReport } from "../src/lib/store";

async function main() {
  const csv = readFileSync(new URL("../demo/merle-reviews.csv", import.meta.url), "utf8");
  const parsed = parseReviewsCsv(csv);
  console.log(`geparst: ${parsed.reviews.length} Reviews`, parsed.detectedColumns);
  const { kept, stats } = cleanReviews(parsed.reviews);
  console.log("clean stats:", stats);

  const tagged = (await llmTag(kept))?.tagged ?? heuristicTag(kept);
  console.log(`getaggt via: ${tagged[0].taggedBy}`);

  let data = buildReport({
    id: "demo",
    tagged,
    cleanStats: stats,
    brandName: "MERLE Bodywear (Demo)",
    category: "Wäsche / DTC",
    llmEnhanced: false,
  });
  data = await enhanceReport(data);

  await saveReport({
    id: "demo",
    status: "ready",
    paid: true, // Demo ist immer freigeschaltet
    data,
    createdAt: new Date().toISOString(),
  });
  console.log("Demo-Report gespeichert: /r/demo");
  console.log(`Angles: ${data.angles.length}, Objections: ${data.objections.length}, Scrollstopper: ${data.scrollstoppers.length}`);
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });
