// Erzeugt den Datensatz fuer den Beispiel-Report (fiktive Marke MERLE Bodywear).
//
// Anders als die erste Fassung baut dieses Skript die Bewertungen NICHT aus
// Textbausteinen zusammen. Jede Bewertung ist einzeln geschrieben und liegt in
// scripts/demo/. Grund: Zusammengesetzte Texte lesen sich alle gleich - dreissig
// Bewertungen mit demselben Nachsatz, und die Zitatauswahl im Report wird
// unbrauchbar.
//
// Enthalten sind absichtlich auch die Faelle, die der Report ausweisen soll:
// persoenliche Daten, leere Eintraege, gekaufte Bewertungen in Serie.
import { writeFileSync } from "fs";
import passform from "./demo/01-passform.mjs";
import material from "./demo/02-material.mjs";
import haltbarkeit from "./demo/03-haltbarkeit.mjs";
import groesse from "./demo/04-groesse.mjs";
import { preis, optik, alltag } from "./demo/05-preis-optik-alltag.mjs";
import { nachhaltigkeit, service, geschenk, scrollstopper, kurz, pii, junk, seeding } from "./demo/06-rest.mjs";
import support from "./demo/07-support.mjs";
import kommentare from "./demo/08-kommentare.mjs";

// Deterministischer Zufall, damit der Datensatz reproduzierbar bleibt.
let seed = 7;
const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const pick = (a) => a[Math.floor(rnd() * a.length)];

const VORNAMEN = ["Anna", "Julia", "Sarah", "Lisa", "Marie", "Nina", "Katharina", "Laura", "Sophie", "Hannah", "Lena", "Clara", "Melanie", "Franziska", "Verena", "Tanja", "Miriam", "Carola", "Jana", "Steffi", "Britta", "Yasmin", "Elif", "Mareike", "Doro", "Kathrin", "Svenja", "Annika", "Rike", "Meike", "Pia", "Kerstin", "Sandra", "Nadine", "Christina", "Bettina", "Ulrike", "Simone", "Heike", "Petra", "Michael", "Thomas", "Jonas", "Felix"];
const NACHNAMEN = ["Müller", "Weber", "Schmidt", "Hoffmann", "Braun", "Vogel", "Fischer", "Wagner", "Becker", "Schulz", "Neumann", "Krüger", "Lorenz", "Huber", "Seidel", "Peters", "Brandt", "Kaiser", "Roth", "Lange", "Werner", "Köhler", "Simon", "Winter", "K.", "S.", "M.", "B."];
const PRODUKTE = ["Soft-Bralette Ida", "Panty Marla", "Bralette Ida", "Slip Greta", "Hipster Tilda", "Triangel-BH Romy", "Body Fee", "Pyjama-Set Luna", "Bustier Nel", "Slip Greta (2er-Pack)"];

const START = new Date("2025-06-01").getTime();
const ENDE = new Date("2026-08-01").getTime();
const WENDE = new Date("2026-01-15").getTime(); // ab hier der neue Schnitt

function datum(spaet) {
  // Normalfall: gleichmaessig ueber den ganzen Zeitraum verteilt, damit die
  // Trendrechnung nicht kuenstlich "fallend" ergibt.
  if (!spaet) return new Date(START + rnd() * (ENDE - START)).toISOString().slice(0, 10);
  // Passform: 85 % nach der Schnittaenderung, der Rest davor. So entsteht ein
  // echter Anstieg statt eines Zufallsergebnisses.
  const von = rnd() < 0.85 ? WENDE : START;
  const bis = von === WENDE ? ENDE : WENDE;
  return new Date(von + rnd() * (bis - von)).toISOString().slice(0, 10);
}

const zeilen = [["title", "body", "rating", "reviewer_name", "review_date", "product_title"]];
const add = (text, rating, spaet = false) =>
  zeilen.push(["", text, String(rating), `${pick(VORNAMEN)} ${pick(NACHNAMEN)}`, datum(spaet), pick(PRODUKTE)]);

// Handgeschriebene Bewertungen. "spaet" nur bei Passform gesetzt - daraus
// entsteht der sichtbare Aufwaertstrend im Report.
for (const g of [passform, material, haltbarkeit, groesse, preis, optik, alltag, nachhaltigkeit, service, geschenk, scrollstopper, kurz]) {
  for (const b of g) add(b.t, b.r, b.spaet === true);
}
for (const b of pii) add(b.t, b.r);
for (const j of junk) add(j, 5);
// Gekaufte Bewertungen: 26x identisch, muss als Serie erkannt werden.
for (let i = 0; i < 26; i++) add(seeding, 5);

const csv = zeilen.map((r) => r.map((c) => `"${String(c).replaceAll('"', '""')}"`).join(",")).join("\n");
writeFileSync(new URL("../demo/merle-reviews.csv", import.meta.url), csv);

const handgeschrieben = [passform, material, haltbarkeit, groesse, preis, optik, alltag, nachhaltigkeit, service, geschenk, scrollstopper].reduce((a, g) => a + g.length, 0);
// Support-Export im Format eines Helpdesk-Systems (Zendesk/Gorgias-nah).
const supportZeilen = [["subject", "description", "created_at"]];
for (const t of support) {
  supportZeilen.push([t.b, t.t, datum(rnd() < 0.6)]);
}
writeFileSync(
  new URL("../demo/merle-support.csv", import.meta.url),
  supportZeilen.map((r) => r.map((c) => `"${String(c).replaceAll('"', '""')}"`).join(",")).join("\n")
);

// Kommentare: einer pro Zeile, so wie man sie aus einem Beitrag kopiert.
writeFileSync(new URL("../demo/merle-kommentare.txt", import.meta.url), kommentare.join("\n"));

console.log(`geschrieben: demo/merle-support.csv (${support.length} Anfragen)`);
console.log(`geschrieben: demo/merle-kommentare.txt (${kommentare.length} Kommentare)`);
console.log(`geschrieben: demo/merle-reviews.csv`);
console.log(`  ${zeilen.length - 1} Zeilen gesamt`);
console.log(`  ${handgeschrieben} einzeln geschriebene Bewertungen`);
console.log(`  ${kurz.length} kurze (mit Absicht teils doppelt), ${pii.length} mit persoenlichen Daten, ${junk.length} leer, 26 gekauft`);
