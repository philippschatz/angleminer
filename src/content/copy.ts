// ============================================================================
//  ALLE TEXTE VON ANGLE MINER — an einer Stelle
// ============================================================================
//
//  Hier steht jeder Satz, den ein Besucher zu sehen bekommt. Wenn du Copy
//  ändern willst, änderst du sie hier — nirgendwo sonst.
//
//  DREI REGELN:
//
//  1. Ändere nur das, was ZWISCHEN den Anführungszeichen steht.
//     Richtig:  h1: "Deine neue Headline",
//     Falsch:   Deine neue Headline,          (Anführungszeichen fehlen)
//
//  2. Das Komma am Zeilenende bleibt stehen.
//
//  3. Geschweifte Klammern wie {anzahl} sind Platzhalter. Die werden beim
//     Anzeigen durch echte Zahlen ersetzt. Du kannst sie verschieben oder
//     weglassen, aber nicht umbenennen — {anzahl} muss {anzahl} bleiben.
//
//  Ein Wort im Text stehen lassen, das du nicht magst? Einfach überschreiben.
//  Die Seite baut sich beim Speichern neu. Kaputtgehen kann nichts, außer du
//  löschst ein Anführungszeichen oder ein Komma.
//
// ============================================================================

/** Ersetzt {platzhalter} durch echte Werte. Nicht anfassen. */
export function fill(text: string, werte: Record<string, string | number>): string {
  return text.replace(/\{(\w+)\}/g, (treffer, schluessel) =>
    schluessel in werte ? String(werte[schluessel]) : treffer
  );
}

// ---------------------------------------------------------------------------
//  BROWSER-TAB & GOOGLE-VORSCHAU
// ---------------------------------------------------------------------------
export const meta = {
  titel: "Angle Miner — Deine Reviews wissen, was verkauft",
  beschreibung:
    "Lade deine Kundenbewertungen hoch und bekomme zehn Ad-Angles, jeder mit Zahlen und echten Zitaten belegt. Für DTC-Marken im DACH-Raum. 49 €, kein Abo.",
};

// ---------------------------------------------------------------------------
//  STARTSEITE
// ---------------------------------------------------------------------------
export const start = {
  navBeispiel: "Beispiel",
  navCta: "Report erstellen",

  // Die beiden schrägen Sticker rechts oben im Hero
  stickerOben: "Kein Abo!",
  stickerUnten: "49 € · fertig",

  // Die Headline ist in vier Teile zerlegt, weil zwei davon farbig
  // hinterlegt sind. Reihenfolge im Satz: teil1 → markiert1 → teil2 → markiert2
  h1Teil1: "Hol dir Ad-Angles in der",
  h1Markiert1: "Stimme deiner Kunden,",
  h1Teil2: "die wirklich",
  h1Markiert2: "konvertieren",

  subline:
    "2.000 Kundenbewertungen rein, 10 belegte Ad-Angles raus — mit Zitaten, Zahlen und Hooks. Das Dokument, das du Agentur oder Creator in die Hand drückst.",

  ctaPrimaer: "Bewertungen hochladen — Vorschau gratis",
  ctaSekundaer: "Erst das Beispiel ansehen",

  vertrauensPunkte: [
    "Ohne Anmeldung",
    "Ohne Zugriff auf deinen Shop",
    "Deine Datei wird nach der Analyse gelöscht",
  ],

  schritte: [
    {
      titel: "Exportieren",
      text: "In deinem Bewertungstool auf Export klicken — Judge.me, Yotpo, Loox, Trustpilot. Zwei Minuten. Nimm alle Sterne mit, auch die schlechten: da stecken die Einwände drin.",
    },
    {
      titel: "Hochladen",
      text: "Doppelte, leere und offensichtlich gekaufte Bewertungen fliegen raus, Namen und Bestellnummern auch. Danach wird jede einzelne Bewertung gelesen — keine Stichprobe, keine Zusammenfassung.",
    },
    {
      titel: "Briefen",
      text: "Zehn Angles mit Zahlen und Zitaten. Die häufigsten Einwände samt Gegenargument. Als Seite und als PDF — das gibst du direkt weiter.",
    },
  ],

  // Der blaue Beweis-Kasten. Die Anführungszeichen um das Zitat setzt die Seite
  // selbst — hier also keine schreiben.
  beweisZitat: "Passform & Sitz: 167 Nennungen, 78 % positiv, Tendenz steigend.",
  beweisText:
    "Solche Sätze stehen drin. Und du kannst jede Zahl bis zum einzelnen Zitat zurückverfolgen.",
  beweisQuelle: "→ genau so steht es im Beispiel-Report",

  preisSticker: "Vorschau gratis",
  preisBetrag: "49 €",
  preisZusatz: "pro Report · bis 5.000 Bewertungen · einmalig",
  preisLeistungen: [
    "10 Ad-Angles, jeder mit Zahlen und Zitaten belegt",
    "Die häufigsten Einwände — und was zufriedene Kunden dagegenhalten",
    "15 Zitate, die im Feed hängenbleiben",
    "Die Wörter, die deine Kunden selbst benutzen",
    "Warnung bei heiklen Aussagen (Klima, Herkunft, Siegel)",
    "Als Webseite und als PDF",
  ],
  preisCta: "Vorschau starten",

  fusszeile:
    "ANGLE MINER · Impressum · Datenschutz · Deine hochgeladene Datei wird nach der Analyse gelöscht.",
};

// ---------------------------------------------------------------------------
//  UPLOAD-SEITE (/new)
// ---------------------------------------------------------------------------
export const upload = {
  zurueck: "← Zurück",
  badge: "Schritt 1 von 2 · Vorschau gratis",
  h1: "Reviews rein!",
  subline: "Du zahlst erst, wenn die Vorschau zeigt, dass sich der Report lohnt.",

  labelMarke: "Marke",
  platzhalterMarke: "z. B. MERLE Bodywear",
  labelKategorie: "Kategorie",
  platzhalterKategorie: "z. B. Wäsche / Skincare / Food",
  labelEmail: "E-Mail",
  labelEmailZusatz: "(optional, für den Link zum Report)",
  platzhalterEmail: "du@marke.de",

  tabDatei: "CSV-Datei",
  tabText: "Text einfügen",

  dropzoneTitel: "Datei hier reinwerfen",
  dropzoneUnterzeile:
    "Judge.me · Yotpo · Loox · Trustpilot · Trusted Shops · Amazon — welche Spalte was bedeutet, erkennen wir selbst",
  textPlatzhalter: "Eine Bewertung pro Absatz einfügen…",

  buttonBereit: "Kostenlos analysieren",
  buttonLaeuft: "Analysiere… (bis zu 1 Minute)",

  datenschutzHinweis:
    "Von Namen bleibt nur der Vorname. E-Mail-Adressen, Bestellnummern und Links werden entfernt, bevor überhaupt analysiert wird. Deine Datei wird danach gelöscht.",

  // Wird eingesetzt, wenn jemand die Felder leer lässt — steht dann im Report
  standardMarke: "Deine Marke",
  standardKategorie: "E-Commerce",

  fehlerKeineDatei: "Bitte wähle eine Datei aus.",
  fehlerZuWenigText: "Das ist noch zu wenig Text. Füge mehr Bewertungen ein.",
  fehlerAllgemein: "Die Analyse hat nicht geklappt.",
  fehlerNetzwerk: "Verbindung weg — bitte nochmal versuchen.",
};

// ---------------------------------------------------------------------------
//  REPORT (/r/…)
// ---------------------------------------------------------------------------
export const report = {
  badgeVoll: "Report · Vollversion ✔",
  badgeVorschau: "Report · Vorschau",
  untertitel: "{kategorie} · erstellt am {datum}",

  kpiBewertungen: "Bewertungen",
  kpiSterne: "Ø Sterne",
  kpiPositiv: "positiv",
  kpiEinwaende: "Einwände",

  datenbasisTitel: "Datenbasis, ehrlich:",
  datenbasisText:
    "{eingelesen} eingelesen · {leer} leere Einträge raus · {doppelt} Doppelte raus · {pii}× persönliche Daten entfernt.",
  seedingWarnung: "⚠ Verdacht auf gekaufte Bewertungen: {liste} — nicht mitgezählt.",
  heuristikHinweis:
    "Hinweis: Dieser Report ist ohne die KI-Tiefenanalyse entstanden. Die Zahlen stimmen, die Auswahl der Zitate ist gröber.",

  angleTitel: "Angle-Map",
  angleChipVoll: "{anzahl} Angles",
  angleChipVorschau: "1 von {anzahl} gratis",
  angleText:
    "Sortiert danach, wie oft ein Thema vorkommt, wie emotional darüber geschrieben wird und wie gut sich die Zitate für Ads eignen.",
  angleNennungen: "{anzahl} Nennungen",
  hookTitel: "Hooks zum Weiterbauen",

  // Verkaufskasten in der Vorschau
  paywallTitel: "Das war 1 von {anzahl}.",
  paywallText:
    "Im vollen Report: alle {anzahl} Angles, die Einwände deiner Kunden samt Gegenbelegen, {scrollstopper} Zitate zum Hängenbleiben und die Wortliste deiner Kunden. Dazu liest die KI jede einzelne Bewertung, statt nur nach Stichworten zu sortieren.",
  paywallFussnote:
    "Einmalzahlung über Stripe · dein Report bleibt unter dieser Adresse abrufbar",
  kaufButton: "Freischalten für 49 €",
  kaufButtonLaeuft: "Weiter zu Stripe…",
  kaufFehler: "Der Checkout hat nicht geklappt.",
  kaufFehlerNetzwerk: "Verbindung weg — bitte nochmal versuchen.",

  gesperrtEinwaendeTitel: "Einwand-Bank",
  gesperrtEinwaendeNotiz: "{anzahl} Kaufbarrieren samt Gegenbelegen",
  gesperrtScrollstopperTitel: "Scrollstopper",
  gesperrtScrollstopperNotiz: "Die Zitate, bei denen man hängenbleibt",
  gesperrtWortlisteTitel: "Wortliste",
  gesperrtWortlisteNotiz: "Die Wörter deiner Kunden, nach Häufigkeit",

  einwaendeTitel: "Einwand-Bank",
  einwaendeChip: "{anzahl} Barrieren",
  einwaendeText:
    "Was Kunden vom Kauf abhält — und welche Zitate zufriedener Kunden du dagegenhalten kannst.",
  einwaendeNennungen: "· {anzahl} Nennungen",
  labelBarriere: "Barriere",
  labelGegenbeleg: "Gegenbeleg",
  keinGegenbeleg:
    "Dazu gibt es in deinen Bewertungen keinen sauberen Gegenbeleg — diesen Punkt offen ansprechen statt wegtexten.",
  keineEinwaende:
    "Kaum Kritik in deinen Bewertungen. Prüfe, ob im Export wirklich alle Sterne enthalten waren — die kritischen sind die wertvollsten.",

  scrollstopperTitel: "Scrollstopper",
  scrollstopperChip: "{anzahl} Stück",
  scrollstopperText:
    "Ungewöhnlich, sehr menschlich, manchmal komisch — die Sorte Zitat, bei der man beim Scrollen hängenbleibt.",

  wortlisteTitel: "Wortliste",
  wortlisteChip: "Kundensprache",
  wortlisteText:
    "Die Wörter deiner Kunden, nach Häufigkeit (pro Bewertung einmal gezählt). Copy, die konvertiert, klingt so.",

  themenTitel: "Alle Themen",
  themenSpalteThema: "Thema",
  themenSpalteNennungen: "Nennungen",
  themenSpaltePositiv: "positiv",

  verarbeitungLaeuft:
    "Zahlung ist da. Jetzt wird jede einzelne Bewertung gelesen und einsortiert — das dauert 1 bis 5 Minuten. Die Seite aktualisiert sich von selbst.",

  pdfButton: "PDF ⬇",

  fusszeile:
    "Erstellt mit ANGLE MINER · Zitate mit ⚠ enthalten rechtlich heikle Aussagen und dürfen nicht wörtlich in Werbung übernommen werden.",

  // Warnhinweis unter einem Zitat mit heikler Aussage
  flagHinweis: "⚠ {label} — nicht wörtlich übernehmen",
  flagLabels: {
    klimaneutral: "Klima-Aussage",
    plastikfrei: "Plastik-Aussage",
    made_in_germany: "Herkunfts-Aussage",
    siegel: "Siegel-Aussage",
    absolut_claim: "Absolut-Aussage",
    heilversprechen: "Gesundheits-Aussage",
  } as Record<string, string>,

  trendSteigend: "↑ steigend",
  trendFallend: "↓ fallend",
  trendStabil: "→ stabil",
};

// ---------------------------------------------------------------------------
//  FEHLERMELDUNGEN BEIM HOCHLADEN
// ---------------------------------------------------------------------------
export const fehler = {
  dateiZuGross:
    "Die Datei ist zu groß (mehr als 15 MB). Exportiere am besten nur die Spalten mit den Bewertungen.",
  keineBewertungen:
    "In der Datei sind keine Bewertungen zu finden. Prüfe, ob es wirklich ein Export aus deinem Bewertungstool ist.",
  zuWenigBewertungen:
    "Nur {anzahl} Bewertungen erkannt. Unter 30 wird der Report dünn — dann verkaufen wir dir lieber keinen. Ab etwa 100 wird es richtig gut.",
  zuVieleGefiltert:
    "Nach dem Aussortieren von Doppelten und leeren Einträgen bleiben zu wenige echte Bewertungen übrig.",
  analyseFehlgeschlagen:
    "Die Analyse hat nicht geklappt. Prüfe, ob die Datei wirklich ein Bewertungs-Export im CSV-Format ist.",
};
