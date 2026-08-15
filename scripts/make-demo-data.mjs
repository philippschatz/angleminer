// Erzeugt einen realistischen synthetischen Review-Datensatz (fiktive Marke "MERLE Bodywear")
// inkl. Duplikaten, Junk, PII und Compliance-Fällen — zum Testen der Pipeline und als Demo-Report.
import { writeFileSync } from "fs";

const rand = (() => { let s = 42; return () => (s = (s * 16807) % 2147483647) / 2147483647; })();
const pick = (arr) => arr[Math.floor(rand() * arr.length)];
const NAMES = ["Anna Müller", "Julia K.", "Sarah Weber", "Lisa Schmidt", "Marie Hoffmann", "Nina Braun", "Katharina Vogel", "Laura Fischer", "Sophie Wagner", "Hannah Becker", "Lena Schulz", "Clara Neumann", "Melanie Krüger", "Franzi Lorenz", "Verena Huber", "Tanja Seidel", "Miriam Peters", "Carola Brandt"];
const PRODUCTS = ["Soft-Bralette Ida", "Panty Marla", "Bralette Ida", "Slip Greta", "Hipster Tilda", "Triangel-BH Romy", "Body Fee", "Pyjama-Set Luna"];

const POOLS = {
  passform_pos: [
    "Endlich ein Bralette, das ich abends vergesse auszuziehen. Sitzt perfekt, nichts drückt.",
    "Die Passform ist der Wahnsinn, nichts verrutscht, auch beim Sport nicht.",
    "Sitzt wie angegossen, kein Einschneiden am Rücken. Habe direkt nachbestellt.",
    "Passt endlich mal wirklich. Ich habe eine große Oberweite und finde selten was, das hält UND bequem ist.",
    "Der Slip zwickt nirgends, auch nach 10 Stunden im Büro nicht.",
    "Hält ohne Bügel besser als meine alten Bügel-BHs. Hätte ich nie gedacht.",
    "Ich spüre sie gar nicht, wie eine zweite Haut.",
    "Kein Verrutschen, kein Zupfen, einfach anziehen und vergessen.",
  ],
  material_pos: [
    "Der Stoff ist unglaublich weich, fühlt sich an wie eine zweite Haut.",
    "Material ist so angenehm auf der Haut, ich will nichts anderes mehr tragen.",
    "Super weiches Material, kratzt null, auch nicht an den Nähten.",
    "Die Qualität vom Stoff merkt man sofort beim Auspacken. Fühlt sich hochwertig an.",
    "Herrlich atmungsaktiv, ich schwitze deutlich weniger als in meiner alten Wäsche.",
    "Kuschelig weich und trotzdem formstabil. Beste Kombi.",
  ],
  haltbarkeit_pos: [
    "Nach über 50 Wäschen sieht das Teil noch aus wie neu. Kein Pilling, nichts leiert aus.",
    "Trage meine seit anderthalb Jahren mehrmals die Woche, Form und Farbe halten.",
    "Die Nähte sind top verarbeitet, da löst sich auch nach vielen Wäschen nichts.",
    "Qualität, die man sonst kaum noch findet. Meine billigen Slips von früher waren nach 3 Monaten durch.",
  ],
  haltbarkeit_neg: [
    "Leider nach etwa 20 Wäschen Pilling am Bund, das hatte ich bei dem Preis nicht erwartet.",
    "Schade, das Bündchen leiert nach ein paar Monaten aus.",
    "Nach einem halben Jahr kleine Löcher an der Naht. Bei dem Preis enttäuschend.",
  ],
  preis: [
    "Nicht günstig, aber jeden Cent wert. Preis-Leistung stimmt für mich.",
    "Teurer als H&M, klar. Aber die Teile halten dafür gefühlt fünfmal so lange.",
    "Der Preis hat mich erst abgeschreckt, aber ich bereue nichts. Lohnt sich.",
    "Für die Qualität geht der Preis absolut in Ordnung, ich kaufe lieber weniger und besser.",
  ],
  preis_neg: [
    "Schön, aber ehrlich gesagt zu teuer für einen Slip.",
    "Qualität okay, aber der Preis ist schon happig. Warte jetzt immer auf Sale.",
  ],
  groesse_neg: [
    "Achtung, fällt kleiner aus! Lieber eine Nummer größer bestellen.",
    "Musste einmal umtauschen, fällt eng aus. Danach perfekt.",
    "Größentabelle stimmt nicht ganz, M ist eher S. Umtausch ging aber problemlos.",
    "Fällt kleiner aus als erwartet, sonst top.",
  ],
  optik: [
    "Wunderschönes Design, schlicht und trotzdem besonders. Die Spitze ist ein Traum.",
    "Sieht so hochwertig aus, ich fühle mich richtig gut darin.",
    "Die Farbe ist noch schöner als auf den Fotos, sehr elegant.",
    "Schlicht, aber edel. Genau mein Geschmack, endlich mal keine Schnörkel.",
  ],
  alltag: [
    "Zeichnet sich unter engen Shirts überhaupt nicht ab, komplett unsichtbar unterm T-Shirt.",
    "Perfekt fürs Büro und für die Couch. Trage nichts anderes mehr.",
    "Auch nach einem langen Arbeitstag noch bequem, das kannte ich so nicht.",
    "Unter dem Blazer, beim Yoga, im Homeoffice, das Teil kann alles.",
  ],
  nachhaltigkeit: [
    "Toll, dass hier auf Nachhaltigkeit geachtet wird. Gekommen wegen dem Gewissen, geblieben wegen dem Komfort.",
    "Ich kaufe bewusster ein und hier stimmt einfach das Gesamtpaket, die Wäsche ist ja klimaneutral produziert.",
    "Endlich Unterwäsche ohne schlechtes Gewissen, komplett plastikfrei verpackt und made in Germany, oder?",
    "Nachhaltig UND schön, das gibt es selten. GOTS-Siegel wäre noch das i-Tüpfelchen.",
  ],
  service: [
    "Umtausch war super easy, Antwort vom Support kam nach zwei Stunden. So geht Kundenservice.",
    "Versand ging schnell, liebevoll verpackt, sogar mit handgeschriebener Karte.",
    "Retoure unkompliziert, Geld war nach drei Tagen zurück.",
  ],
  scrollstopper: [
    "Mein Mann fragte, ob ich was Neues mit mir angestellt hätte. Nein, nur neue Unterwäsche. 😂",
    "Ehrlich gesagt wollte ich nur einen Slip testen und jetzt ist mein halber Kleiderschrank von euch. Schickt Hilfe.",
    "Ich bin normalerweise zu faul für Bewertungen, aber hier MUSSTE ich. Dieses Bralette hat mein Leben verändert, keine Werbung, ich schwöre.",
    "Kleiner Tipp: kauft nicht nur eins. Ihr wollt danach eh nie wieder was anderes tragen und dann ist Waschtag ein Drama.",
    "Habe das Set meiner Schwester geschenkt und dann heimlich selbst anprobiert. Jetzt haben wir beide eins. Familienfrieden gerettet.",
    "Peinlich, aber wahr: Ich habe den Wäschekauf jahrelang gehasst wie Steuererklärung. Das hier war der erste, der Spaß gemacht hat.",
  ],
  geschenk: [
    "Als Geschenk für meine Freundin gekauft, sie liebt es. Jetzt bestellt sie selbst nach.",
    "Perfektes Weihnachtsgeschenk, kam super an.",
  ],
  gemischt: [
    "Material toll, Passform gut, aber die Lieferung hat fast zwei Wochen gedauert. Einziges Manko.",
    "Wunderschön und bequem, aber der einzige Wermutstropfen: die Farbe war schnell verwaschen.",
    "Top Slip, aber die Spitze am Bein rollt sich manchmal ein. Trotzdem Wiederkauf.",
  ],
  kurz_pos: [
    "Super Qualität, super Passform, tolles Design.",
    "Bin begeistert, gerne wieder!",
    "Alles top, sehr zufrieden.",
    "Toller Stoff, toller Sitz.",
  ],
};

const PII_REVIEWS = [
  "Toller BH! Bei Fragen zu meiner Bestellung S483920 erreicht ihr mich unter anna.mueller@gmail.com.",
  "Passt super. Meine Bestellnummer war E291837, der Umtausch lief top. Ruft mich gern an: 0176 4483920.",
  "Sehr schön, mehr Fotos auf meinem Blog https://annas-lingerie-tagebuch.de",
];

const JUNK = ["***********", "(redacted)", "ok", "👍👍👍", "gut", "."];
const SEEDED = "Tolles Produkt, gerne wieder. Schnelle Lieferung, alles bestens.";

function dateBetween(start, end) {
  const t = start.getTime() + rand() * (end.getTime() - start.getTime());
  return new Date(t).toISOString().slice(0, 10);
}

const PREFIXES = ["", "", "", "Kurzes Update nach drei Monaten: ", "Zweitbestellung. ", "Nach langem Zögern doch bestellt und was soll ich sagen: ", "Erst skeptisch gewesen. ", "Für den Sommer gekauft. ", "Mein dritter Kauf hier. ", "Auf Empfehlung einer Freundin bestellt. ", "Ich trage sonst nur bekannte Marken, aber: ", "Update zu meiner letzten Bewertung: ", "Nach dem Umzug alles neu gekauft, unter anderem das hier. ", "Im Urlaub getestet. ", "Direkt am ersten Tag angezogen. "];
const SUFFIXES = ["", "", "", " Klare Empfehlung.", " Gerne wieder.", " Werde weitere Farben bestellen.", " Danke dafür!", " Fünf Sterne dafür.", " Meine Schwester bekommt jetzt auch eins.", " Bin gespannt, wie es sich nach mehr Wäschen hält.", " Der Rest der Familie ist genervt, wie oft ich davon erzähle.", " Kleiner Stern Abzug wäre gemein.", " Bitte nie aus dem Sortiment nehmen.", " Nachschub ist schon bestellt.", " So darf das gerne bleiben."];

function vary(body) {
  return `${pick(PREFIXES)}${body}${pick(SUFFIXES)}`;
}

const rows = [["title", "body", "rating", "reviewer_name", "review_date", "product_title"]];
const start = new Date("2025-06-01");
const end = new Date("2026-08-01");
// Die Trendrechnung im Report halbiert die Zeitspanne und vergleicht beide Hälften.
// Damit ein gewollter Anstieg dort ankommt, muss die Trennlinie hier exakt auf der
// Mitte liegen und die beiden Fenster müssen disjunkt sein — sonst streuen die
// "frühen" Reviews bis ins späte Fenster und verwässern den Effekt.
const lateStart = new Date("2026-01-01"); // Mitte von start..end

// Der Report zählt Nennungen je THEMA, nicht Reviews je Pool — und Passform-Nennungen
// entstehen quer durch fast alle Pools ("Super Qualität, super Passform" steckt in
// kurz_pos, "fällt eng aus" in groesse_neg). Steuert man das Datum pro Pool, verschiebt
// man nur eine Minderheit der Nennungen und der Trend verpufft. Deshalb hängt das Datum
// am Inhalt. Das Muster spiegelt die Passform-Keywords des Taggers grob wider; ändert
// sich dort die Themenerkennung, muss es hier nachgezogen werden.
const PASSFORM_RE = /passform|sitzt|sitz\b|passt |schnitt|eng\b|drückt|einschneid|verrutscht|hält\b|zwickt|kneift/i;
const LATE_SHARE_PASSFORM = 0.62; // Passform wird im 2. Zeitraum spürbar häufiger genannt
const LATE_SHARE_REST = 0.45;

function push(body, rating, opts = {}) {
  const title = opts.title ?? "";
  const late = rand() < (PASSFORM_RE.test(body) ? LATE_SHARE_PASSFORM : LATE_SHARE_REST);
  rows.push([
    title,
    body,
    String(rating),
    pick(NAMES),
    late ? dateBetween(lateStart, end) : dateBetween(start, lateStart),
    pick(PRODUCTS),
  ]);
}

// Verteilung: ~620 Reviews
const plan = [
  ["passform_pos", 118, 5, {}],
  ["material_pos", 96, 5, {}],
  ["haltbarkeit_pos", 64, 5, {}],
  ["haltbarkeit_neg", 26, 2, {}],
  ["preis", 44, 4, {}],
  ["preis_neg", 18, 3, {}],
  ["groesse_neg", 38, 3, {}],
  ["optik", 58, 5, {}],
  ["alltag", 52, 5, {}],
  ["nachhaltigkeit", 24, 5, {}],
  ["service", 22, 5, {}],
  ["scrollstopper", 14, 5, {}],
  ["geschenk", 12, 5, {}],
  ["gemischt", 20, 4, {}],
  ["kurz_pos", 40, 5, {}],
];

const seen = new Set();
for (const [pool, n, rating] of plan) {
  for (let i = 0; i < n; i++) {
    let body = vary(pick(POOLS[pool]));
    let guard = 0;
    while (seen.has(body) && guard++ < 20) body = vary(pick(POOLS[pool]));
    seen.add(body);
    const r = rating === 5 && rand() < 0.2 ? 4 : rating;
    push(body, r);
  }
}
// PII-Fälle
for (const b of PII_REVIEWS) push(b, 5, {});
// Junk
for (const j of JUNK) push(j, 5, {});
// Seeding-Duplikate (26x identisch)
for (let i = 0; i < 26; i++) push(SEEDED, 5, {});

const csv = rows
  .map((r) => r.map((c) => `"${String(c).replaceAll('"', '""')}"`).join(","))
  .join("\n");
writeFileSync(new URL("../demo/merle-reviews.csv", import.meta.url), csv);
console.log(`geschrieben: demo/merle-reviews.csv (${rows.length - 1} Reviews)`);
