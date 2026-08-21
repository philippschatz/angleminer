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
  navAnmelden: "Anmelden",
  navCta: "Report erstellen",

  // Die beiden schrägen Sticker rechts oben im Hero
  stickerOben: "Kein Abo!",
  stickerUnten: "49 € · fertig",

  // Die Headline ist in vier Teile zerlegt, weil zwei davon farbig
  // hinterlegt sind. Reihenfolge im Satz: teil1 → markiert1 → teil2 → markiert2
  h1Teil1: "Hol dir authentische",
  h1Markiert1: "Ad-Angles,",
  h1Teil2: "die",
  h1Markiert2: "verkaufen.",

  // Die Subline trägt den Beweis für das Versprechen der Headline: woher die
  // Angles kommen und warum sie belegt sind. Ohne sie wäre "die verkaufen"
  // eine reine Behauptung.
  subline:
    "Nicht geraten, sondern aus deinen eigenen Kundenbewertungen gezogen — First-Party-Daten in der Stimme deiner Kundinnen, an die kein Wettbewerber herankommt. Mit wörtlichen Zitaten, Zahlen zum Nachzählen und fertigen Hooks. Das Dokument, das du Agentur oder Creator in die Hand drückst.",

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
  buttonLaeuft: "Analysiere…",

  datenschutzHinweis:
    "Die Analyse läuft in deinem Browser. Deine Datei wird nicht hochgeladen — Namen, E-Mail-Adressen und Bestellnummern werden auf deinem Rechner entfernt, bevor überhaupt etwas zu uns geht.",

  // Vorschau, die direkt auf dieser Seite erscheint
  vorschauBadge: "Deine Vorschau · auf deinem Rechner gerechnet",
  vorschauHinweisLokal:
    "Diese Vorschau ist auf deinem Rechner entstanden. Bei uns liegt bis jetzt nichts. Erst wenn du auf Freischalten klickst, gehen Bewertungstext, Sterne und Datum zu uns — ohne Namen.",
  vorschauNeueDatei: "Andere Datei nehmen",
  vorschauAbgeschnitten:
    "Hinweis: Deine Datei enthält mehr als {max} Bewertungen. Analysiert wurden die ersten {max}, die restlichen {rest} bleiben unberücksichtigt.",
  vorschauUploadLaeuft: "Daten werden übertragen…",

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

  // Quellenvergleich — nur sichtbar, wenn mehr als eine Quelle geliefert wurde.
  lueckenTitel: "Was Bewertungen verschweigen",
  lueckenChip: "{anzahl} Fundstellen",
  lueckenText:
    "Bewertungen entstehen öffentlich, oft auf eine Erinnerungsmail hin, in guter Stimmung. Support-Anfragen und Kommentare entstehen, wenn jemand ein Problem oder eine Frage hat. Hier stehen die Themen, die in den anderen Quellen deutlich mehr Raum einnehmen als in deinen Bewertungen — sortiert nach Abstand.",
  lueckenZeile: "{anteil} % der {quelle} · in Bewertungen nur {bewertungen} %",
  lueckenAbstand: "+{punkte} Punkte",
  lueckenGrundwert:
    "Zur Einordnung: {liste}. Dass Support kritischer klingt als Bewertungen, ist normal — verglichen wird deshalb der Raum, den ein Thema einnimmt, nicht die Stimmung.",
  lueckenGrundwertTeil: "{quelle} {anzahl} Texte, {positiv} % positiv",
  quellenBadge: "{quelle}",

  themenTitel: "Alle Themen",
  themenSpalteThema: "Thema",
  themenSpalteNennungen: "Nennungen",
  themenSpaltePositiv: "positiv",

  verarbeitungLaeuft:
    "Zahlung ist da. Jetzt wird jede einzelne Bewertung gelesen und einsortiert. Du kannst diese Seite ruhig schließen — es läuft ohne dich weiter, und du bekommst eine Mail, sobald der Report fertig ist.",
  verarbeitungFortschritt: "{erledigt} von {gesamt} Bewertungen gelesen",

  // Nur im Beispiel-Report sichtbar. Ohne den Hinweis fragt sich ein Besucher
  // aus einer anderen Branche, was ihn Waesche angeht - und ohne den Kasten am
  // Ende kann er nicht kaufen, obwohl er gerade ueberzeugt wurde.
  demoBanner:
    "Das ist ein Beispiel-Report aus echten, anonymisierten Bewertungen einer Wäschemarke. Genauso funktioniert er für Skincare, Food, Möbel oder Sportgeräte — die Themen findet die Analyse in deinen Daten selbst.",
  demoCtaTitel: "Das war eine fremde Marke.",
  demoCtaText:
    "Jetzt mit deinen Bewertungen: Datei rein, Vorschau sofort und kostenlos. Bezahlt wird erst, wenn du gesehen hast, dass sich der Report lohnt.",
  demoCtaButton: "Eigene Bewertungen hochladen",
  demoCtaFussnote: "Vorschau gratis · 49 € einmalig · kein Abo",

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
//  NEWSLETTER-EINWILLIGUNG (Double-Opt-in)
// ---------------------------------------------------------------------------
//  ACHTUNG, rechtlich relevant: Die Checkbox darf NIEMALS vorangehakt sein,
//  und der Text muss sagen, worum es geht und dass man jederzeit aussteigen
//  kann. Ändere die Formulierung nur mit Bedacht.
export const einwilligung = {
  checkboxText:
    "Schickt mir ab und zu Tipps zu Voice-of-Customer und Paid Social. Kein fester Rhythmus, Abmeldung mit einem Klick.",
  checkboxHinweis:
    "Du bekommst zuerst eine Mail mit einem Bestätigungslink. Erst danach schicken wir dir etwas.",

  // Eigenständiges Feld in der Vorschau — für Leute, die (noch) nicht kaufen
  vorschauTitel: "Noch nicht überzeugt?",
  vorschauText:
    "Dann lass dir zeigen, wie andere Marken aus ihren Bewertungen Anzeigen bauen. Ab und zu eine Mail, kein fester Rhythmus.",
  vorschauPlatzhalter: "du@marke.de",
  vorschauButton: "Eintragen",
  vorschauButtonLaeuft: "Moment…",
  vorschauDanke:
    "Fast geschafft: Wir haben dir eine Mail mit einem Bestätigungslink geschickt. Erst mit dem Klick bist du dabei.",
  vorschauFehler: "Das hat nicht geklappt. Bitte prüf die Adresse.",

  // Landeseiten nach Klick auf den Link in der Mail
  bestaetigtTitel: "Bestätigt!",
  bestaetigtText:
    "Du bist eingetragen. Wenn es wieder etwas Brauchbares gibt, hörst du von uns — und in jeder Mail steht ein Abmeldelink.",
  abgemeldetTitel: "Abgemeldet.",
  abgemeldetText:
    "Du bekommst keine Werbe-Mails mehr von uns. Mails zu deinen gekauften Reports laufen davon unabhängig weiter.",
  ungueltigTitel: "Link nicht mehr gültig",
  ungueltigText:
    "Dieser Link ist abgelaufen oder wurde schon benutzt. Trag dich einfach neu ein.",
  zurStartseite: "Zur Startseite",
};

// ---------------------------------------------------------------------------
//  KONTO & ANMELDUNG
// ---------------------------------------------------------------------------
export const konto = {
  // Anmeldeseite
  loginTitel: "Anmelden",
  loginText:
    "Gib die E-Mail-Adresse ein, mit der du bezahlt hast. Du bekommst einen Link zugeschickt — damit bist du drin. Kein Passwort nötig.",
  loginLabel: "E-Mail",
  loginPlatzhalter: "du@marke.de",
  loginButton: "Link schicken",
  loginButtonLaeuft: "Wird geschickt…",
  loginGesendet:
    "Wenn es zu dieser Adresse ein Konto gibt, ist der Link unterwegs. Er gilt 30 Minuten.",
  loginFehler: "Das hat nicht geklappt. Bitte versuch es nochmal.",
  loginLinkUngueltig:
    "Dieser Link ist abgelaufen oder wurde schon benutzt. Fordere einfach einen neuen an.",

  // Kontobereich
  titel: "Deine Reports",
  begruessung: "Angemeldet als {email}",
  abmelden: "Abmelden",
  leer:
    "Hier ist noch nichts. Sobald du einen Report freischaltest, taucht er an dieser Stelle auf.",
  neuerReport: "Neuen Report erstellen",
  spalteMarke: "Marke",
  spalteDatum: "Erstellt",
  spalteStatus: "Status",
  statusFertig: "fertig",
  statusLaeuft: "wird gerechnet",
  statusOffen: "nicht bezahlt",
  oeffnen: "Öffnen",
  zitateGeloescht:
    "Zitate entfernt — die Zahlen bleiben zum Vergleich erhalten.",
};

// ---------------------------------------------------------------------------
//  E-MAILS
// ---------------------------------------------------------------------------
export const mails = {
  anmeldenBetreff: "Dein Zugang zu Angle Miner",
  anmeldenText: `Hier ist dein Anmeldelink:

{link}

Der Link gilt 30 Minuten und funktioniert einmal. Wenn du dich nicht angemeldet hast, kannst du diese Mail ignorieren.

— Angle Miner`,

  fertigBetreff: "Dein Report für {marke} ist fertig",
  fertigText: `Die Tiefenanalyse ist durch. Jede einzelne Bewertung wurde gelesen und einsortiert.

Hier ist dein Report:
{link}

Der Link führt direkt in dein Konto. Tipp: Sichere dir das PDF, dann hast du den Report unabhängig von uns.

— Angle Miner`,

  erstattungBetreff: "Wir haben dir das Geld zurückerstattet — {marke}",
  erstattungText: `Bei deinem Report ist die KI-Tiefenanalyse zum großen Teil ausgefallen. Du hast trotzdem einen vollständigen Report bekommen, aber eben nicht den, für den du bezahlt hast.

Deshalb haben wir dir die 49 € ohne Nachfrage zurückerstattet. Das Geld ist in ein paar Werktagen zurück auf deinem Konto.

Dein Report bleibt dir erhalten:
{link}

Wenn du magst, versuch es später nochmal — dann meistens mit dem vollen Ergebnis.

— Angle Miner`,

  bestaetigenBetreff: "Bitte einmal bestätigen",
  bestaetigenText: `Du möchtest ab und zu Post von Angle Miner bekommen. Bestätige das bitte einmal mit diesem Link:

{link}

Erst danach schicken wir dir etwas. Wenn du dich nicht eingetragen hast, ignoriere diese Mail einfach — dann passiert nichts.

— Angle Miner`,

  ablaufBetreff: "Deine Reports werden in {tage} Tagen aufgeräumt",
  ablaufText: `Du warst länger nicht mehr angemeldet. In {tage} Tagen entfernen wir deshalb die Zitate und Bewertungstexte aus deinen Reports — die Zahlen und Auswertungen bleiben erhalten, du kannst also weiter vergleichen.

Wenn du sie behalten willst, melde dich einfach einmal an:
{link}

— Angle Miner`,
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
  uploadUngueltig:
    "Die übertragenen Daten waren unvollständig. Lade die Seite neu und versuche es nochmal.",
};
