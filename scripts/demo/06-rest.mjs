// Nachhaltigkeit — enthält bewusst Aussagen, die die Compliance-Warnung
// auslösen (Klima, Plastik, Herkunft, Siegel). Genau das soll der Report zeigen:
// Kundenzitate, die man NICHT unveraendert in eine Anzeige übernehmen darf.
export const nachhaltigkeit = [
  { t: "Gekommen wegen dem Gewissen, geblieben wegen dem Komfort. So müsste das immer laufen.", r: 5 },
  { t: "Toll dass die Wäsche klimaneutral produziert wird, das war für mich der Ausschlag.", r: 5 },
  { t: "Die Verpackung ist komplett plastikfrei, sogar das Klebeband ist Papier. Kleine Sache, fällt mir aber auf.", r: 5 },
  { t: "Ich dachte das ist made in Germany? Auf dem Etikett steht Portugal. Nicht schlimm, aber ich hatte es anders verstanden.", r: 4 },
  { t: "Ein GOTS-Siegel wäre noch das i-Tüpfelchen, sonst top.", r: 4 },
  { t: "Ich kaufe bewusster ein und achte auf Lieferketten. Hier findet man die Infos wenigstens ohne zu suchen.", r: 5 },
  { t: "nachhaltig UND bequem gibts selten. hier passt es", r: 5 },
];
export const service = [
  { t: "Retoure war in drei Tagen erledigt und das Geld direkt zurück. So macht Umtauschen fast Spass.", r: 5 },
  { t: "Habe am Sonntag geschrieben und Montag früh eine Antwort von einem Menschen bekommen, nicht von einem Bot.", r: 5 },
  { t: "Versand hat neun Tage gedauert, das war zu lang. Produkt selbst ist super, deshalb drei Sterne.", r: 3 },
  { t: "Liebevoll verpackt mit einer handgeschriebenen Karte. Ich weiss, das skaliert nicht, aber es hat gewirkt.", r: 5 },
  { t: "Paket kam beschädigt an, Ersatz war zwei Tage später da. Ohne Diskussion.", r: 4 },
];
export const geschenk = [
  { t: "Für meine Schwester zum Geburtstag gekauft. Sie hat sich am nächsten Tag selbst zwei nachbestellt.", r: 5 },
  { t: "Als Geschenk für meine Frau, sie war begeistert und ich bin jetzt kurzzeitig der Held.", r: 5 },
  { t: "Verschenkt und dann heimlich selbst anprobiert. Jetzt haben wir beide eins.", r: 5 },
  { t: "Geschenkverpackung war schön, aber 4,90 extra dafür finde ich happig.", r: 4 },
];
// Scrollstopper — sehr menschlich, ungewoehnlich, zum Hängenbleiben.
export const scrollstopper = [
  { t: "Mein Mann hat gefragt ob ich beim Friseur war. Nein. Neue Unterwäsche.", r: 5 },
  { t: "Ich wollte einen Slip testen und jetzt ist meine halbe Schublade von euch. Schickt Hilfe oder einen Rabattcode.", r: 5 },
  { t: "Ich schreibe normalerweise keine Bewertungen weil ich zu faul bin. Hier sitze ich jetzt und tippe. Macht was ihr wollt mit dieser Information.", r: 5 },
  { t: "Kleiner Tipp: kauft nicht nur eins. Sonst ist Waschtag ein emotionales Problem.", r: 5 },
  { t: "Peinlich aber wahr: Ich habe Wäschekauf jahrelang gehasst wie Steuererklärung. Das hier war der erste Kauf, der Spass gemacht hat.", r: 5 },
  { t: "Habe es meiner Mutter gezeigt. Sie ist 68 und hat sich zwei bestellt. Wir reden jetzt über Unterwäsche, danke dafür.", r: 5 },
  { t: "Ich habe das Teil aus der Wäsche gefischt und wieder angezogen, weil ich nicht auf das andere warten wollte. Bin ich stolz drauf? Nein.", r: 5 },
  { t: "Meine Katze hat sich draufgelegt und will nicht runter. Sie hat Geschmack.", r: 5 },
];
// Kurze, generische Bewertungen — in echten Korpora der größte Anteil.
// Doppelungen sind Absicht: der Report soll sie ehrlich als Duplikate ausweisen.
export const kurz = [
  { t: "Alles top, sehr zufrieden.", r: 5 }, { t: "Alles top, sehr zufrieden.", r: 5 },
  { t: "Bin begeistert, gerne wieder!", r: 5 }, { t: "Bin begeistert, gerne wieder!", r: 5 },
  { t: "Super Qualität, tolle Passform.", r: 5 }, { t: "Super Qualität, tolle Passform.", r: 5 },
  { t: "Sehr bequem.", r: 5 }, { t: "Sehr bequem.", r: 5 }, { t: "Sehr bequem.", r: 4 },
  { t: "Wie beschrieben, danke.", r: 5 }, { t: "Wie beschrieben, danke.", r: 5 },
  { t: "Passt, danke!", r: 5 }, { t: "Empfehlung.", r: 5 }, { t: "Top!", r: 5 },
  { t: "Gerne wieder.", r: 5 }, { t: "Gerne wieder.", r: 5 },
  { t: "Schnelle Lieferung, gute Ware.", r: 5 }, { t: "Schnelle Lieferung, gute Ware.", r: 5 },
  { t: "Sitzt gut, fällt aber klein aus.", r: 4 },
  { t: "Guter Stoff.", r: 5 }, { t: "Sehr schön.", r: 5 }, { t: "Bequem und schön.", r: 5 },
];
// Testfälle: persoenliche Daten, die der Scrub entfernen muss.
export const pii = [
  { t: "Toller BH! Bei Fragen zu Bestellung S483920 erreicht ihr mich unter anna.mueller@gmail.com.", r: 5 },
  { t: "Passt super. Meine Bestellnummer war E291837, Umtausch lief top. Ruft gern an: 0176 4483920.", r: 5 },
  { t: "Sehr schön, mehr Fotos auf meinem Blog https://annas-wäsche-tagebuch.de", r: 5 },
  { t: "Rückerstattung bitte auf DE89 3704 0044 0532 0130 00, danke.", r: 4 },
];
// Junk, der herausfliegen muss.
export const junk = ["***********", "(redacted)", "ok", "👍👍👍", "gut", ".", "-", "test"];
// Gekaufte Bewertungen: identischer Text in Serie.
export const seeding = "Tolles Produkt, gerne wieder. Schnelle Lieferung, alles bestens.";
