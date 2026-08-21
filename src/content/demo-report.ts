// ERZEUGT — nicht von Hand bearbeiten.
// Neu erzeugen mit: npx tsx scripts/seed-demo.ts
//
// Der Beispiel-Report liegt bewusst als fertiges Dokument im Code und nicht
// nur in der Datenbank: so ist /r/demo in jeder Umgebung sofort erreichbar.
import { ReportData } from "@/lib/pipeline/types";

export const demoReport: ReportData = {
 "id": "demo",
 "createdAt": "2026-08-21T12:50:37.858Z",
 "brandName": "MERLE Bodywear",
 "category": "Wäsche / DTC",
 "cleanStats": {
  "input": 268,
  "kept": 229,
  "duplicates": 33,
  "junk": 6,
  "piiScrubbed": 4,
  "seedingAlert": [
   {
    "body": "Tolles Produkt, gerne wieder. Schnelle Lieferung, alles bestens.",
    "count": 26
   }
  ]
 },
 "totalAnalyzed": 229,
 "ratingAvg": 4.66,
 "sentimentSplit": {
  "positiv": 138,
  "negativ": 10,
  "gemischt": 7,
  "neutral": 74
 },
 "themeCounts": [
  {
   "theme": "sonstiges",
   "count": 70,
   "positivePct": 61
  },
  {
   "theme": "passform",
   "count": 39,
   "positivePct": 72
  },
  {
   "theme": "groesse_erwartung",
   "count": 24,
   "positivePct": 13
  },
  {
   "theme": "material_haptik",
   "count": 21,
   "positivePct": 81
  },
  {
   "theme": "haltbarkeit",
   "count": 21,
   "positivePct": 67
  },
  {
   "theme": "preis_wert",
   "count": 21,
   "positivePct": 48
  },
  {
   "theme": "optik_design",
   "count": 21,
   "positivePct": 71
  },
  {
   "theme": "service_versand",
   "count": 21,
   "positivePct": 43
  },
  {
   "theme": "funktion_alltag",
   "count": 20,
   "positivePct": 60
  },
  {
   "theme": "nachhaltigkeit",
   "count": 7,
   "positivePct": 57
  },
  {
   "theme": "geschenk_anlass",
   "count": 7,
   "positivePct": 57
  }
 ],
 "angles": [
  {
   "title": "Passform & Sitz",
   "theme": "passform",
   "mentions": 39,
   "sharePct": 17,
   "positivePct": 72,
   "trend": "steigend",
   "quotes": [
    {
     "text": "Ich habe 75B und finde normalerweise nie was, das ohne Bügel hält. Das hier hält. Keine Ahnung wie, aber es hält.",
     "date": "2026-02-25",
     "rating": 5,
     "quelle": "bewertung",
     "complianceFlags": []
    },
    {
     "text": "Der Beinausschnitt beim Slip liegt flach an und rollt sich nicht ein. Klingt nach einer Kleinigkeit, ist aber genau das was mich sonst immer stört.",
     "date": "2026-03-25",
     "rating": 5,
     "quelle": "bewertung",
     "complianceFlags": []
    },
    {
     "text": "Ich trage sonst ausschliesslich Calida und wollte eigentlich nur mal vergleichen. Der Sitz ist hier ehrlich gesagt besser.",
     "date": "2025-06-26",
     "rating": 5,
     "quelle": "bewertung",
     "complianceFlags": []
    },
    {
     "text": "Nach dem Waschen sitzt es genauso wie vorher, das ist bei mir bisher bei keinem Bralette so gewesen.",
     "date": "2025-08-05",
     "rating": 5,
     "quelle": "bewertung",
     "complianceFlags": []
    },
    {
     "text": "Bin 1,80m und habe lange Probleme mit zu kurzen Oberteilen. Der Body sitzt in der Länge tatsächlich richtig.",
     "date": "2026-05-31",
     "rating": 5,
     "quelle": "bewertung",
     "complianceFlags": []
    }
   ],
   "hooks": [
    "Endlich eine Passform, über die Kundinnen von selbst schreiben.",
    "Sitzt. Den ganzen Tag. Sagen nicht wir — sagen die Reviews.",
    "„Ich habe 75B und finde normalerweise nie was, das ohne Bügel hält. Das hier hält…\""
   ],
   "score": 59
  },
  {
   "title": "Größe & Erwartung",
   "theme": "groesse_erwartung",
   "mentions": 24,
   "sharePct": 10,
   "positivePct": 13,
   "trend": "unklar",
   "quotes": [
    {
     "text": "Ich würde jedem raten, im Zweifel die größere Größe zu nehmen. Bei mir war es genau der Unterschied.",
     "date": "2025-06-01",
     "rating": 4,
     "quelle": "bewertung",
     "complianceFlags": []
    },
    {
     "text": "Habe nach der Größenberatung im Chat bestellt und es hat auf Anhieb gepasst. Ohne die Beratung hätte ich falsch gegriffen.",
     "date": "2026-04-16",
     "rating": 5,
     "quelle": "bewertung",
     "complianceFlags": []
    },
    {
     "text": "Größe zwischen zwei — Ich liege zwischen S und M. Was empfehlen Sie? Ich möchte nicht wieder zurückschicken müssen.",
     "date": "2026-02-27",
     "quelle": "support",
     "complianceFlags": []
    }
   ],
   "hooks": [
    "Fällt es kleiner aus? Das sagen Käufer wirklich.",
    "Die Größenfrage — beantwortet von Leuten, die bestellt haben.",
    "„Ich würde jedem raten, im Zweifel die größere Größe zu nehmen. Bei mir war es ge…\""
   ],
   "score": 36
  },
  {
   "title": "Material & Haptik",
   "theme": "material_haptik",
   "mentions": 21,
   "sharePct": 9,
   "positivePct": 81,
   "trend": "stabil",
   "quotes": [
    {
     "text": "Hatte erst Sorge dass es zu locker ist weil es sich so weich anfühlt. Falscher Alarm, der Halt ist da.",
     "date": "2025-10-23",
     "rating": 5,
     "quelle": "bewertung",
     "complianceFlags": []
    },
    {
     "text": "Kratzt nicht, pieksen tut auch nichts, und das Etikett ist aufgedruckt statt eingenäht. Wer sowas entscheidet, hat verstanden.",
     "date": "2026-04-10",
     "rating": 5,
     "quelle": "bewertung",
     "complianceFlags": []
    },
    {
     "text": "Der Stoff ist so weich, dass ich beim Auspacken kurz gelacht habe. Das ist nämlich albern, aber ich habe es tatsächlich erst an die Wange gehalten.",
     "date": "2026-04-22",
     "rating": 5,
     "quelle": "bewertung",
     "complianceFlags": []
    },
    {
     "text": "Das Material ist deutlich dicker als erwartet, im positiven Sinne. Fühlt sich nicht nach Wegwerfware an.",
     "date": "2025-08-24",
     "rating": 5,
     "quelle": "bewertung",
     "complianceFlags": []
    },
    {
     "text": "sehr angenehm auf der haut, kein vergleich zu meinem alten zeug von h&m",
     "date": "2026-02-25",
     "rating": 5,
     "quelle": "bewertung",
     "complianceFlags": []
    }
   ],
   "hooks": [
    "Das Erste, was Kunden erwähnen: wie es sich anfühlt.",
    "Zweite Haut ist ein Kundenzitat, kein Marketing-Sprech.",
    "„Hatte erst Sorge dass es zu locker ist weil es sich so weich anfühlt. Falscher A…\""
   ],
   "score": 35
  },
  {
   "title": "Haltbarkeit & Qualität",
   "theme": "haltbarkeit",
   "mentions": 21,
   "sharePct": 9,
   "positivePct": 67,
   "trend": "steigend",
   "quotes": [
    {
     "text": "wäsche bei 30 grad, trocknen an der luft, nach einem jahr noch top",
     "date": "2026-07-16",
     "rating": 5,
     "quelle": "bewertung",
     "complianceFlags": []
    },
    {
     "text": "Kleine Löcher an der Seitennaht nach etwa einem halben Jahr. Support hat sofort ersetzt, deshalb trotzdem vier Sterne.",
     "date": "2025-12-04",
     "rating": 4,
     "quelle": "bewertung",
     "complianceFlags": []
    },
    {
     "text": "Ich habe das Teil aus der Wäsche gefischt und wieder angezogen, weil ich nicht auf das andere warten wollte. Bin ich stolz drauf? Nein.",
     "date": "2026-02-14",
     "rating": 5,
     "quelle": "bewertung",
     "complianceFlags": []
    },
    {
     "text": "beste Wäsche die ich habe, kann ich nur empfehlen",
     "quelle": "kommentar",
     "complianceFlags": []
    },
    {
     "text": "Ich habe eine Neurodermitis-Neigung und reagiere auf fast alle Nähte. Hier bisher null Probleme, auch nach mehreren Wochen.",
     "date": "2026-06-13",
     "rating": 5,
     "quelle": "bewertung",
     "complianceFlags": []
    }
   ],
   "hooks": [
    "Nach 50 Wäschen noch im Einsatz — laut den Leuten, die es wissen müssen.",
    "Qualität, die in Reviews mit Monaten und Jahren belegt wird.",
    "„wäsche bei 30 grad, trocknen an der luft, nach einem jahr noch top\""
   ],
   "score": 35
  },
  {
   "title": "Optik & Design",
   "theme": "optik_design",
   "mentions": 21,
   "sharePct": 9,
   "positivePct": 71,
   "trend": "steigend",
   "quotes": [
    {
     "text": "Farbe Terracotta ist ein Traum und deutlich wärmer als auf dem Bildschirm.",
     "date": "2025-06-24",
     "rating": 5,
     "quelle": "bewertung",
     "complianceFlags": []
    },
    {
     "text": "Ich habe das erste Teil vor 14 Monaten gekauft und trage es noch. Die Farbe ist minimal blasser, die Form komplett erhalten.",
     "date": "2025-11-24",
     "rating": 5,
     "quelle": "bewertung",
     "complianceFlags": []
    },
    {
     "text": "Geschenkverpackung war schön, aber 4,90 extra dafür finde ich happig.",
     "date": "2026-01-30",
     "rating": 4,
     "quelle": "bewertung",
     "complianceFlags": []
    },
    {
     "text": "Schlicht, ohne Schnörkel, ohne Glitzer. Genau deshalb habe ich es gekauft.",
     "date": "2026-07-06",
     "rating": 5,
     "quelle": "bewertung",
     "complianceFlags": []
    },
    {
     "text": "Die Spitze am Rand ist wirklich schön gemacht, ich habe das im Bild unterschätzt.",
     "date": "2025-08-24",
     "rating": 5,
     "quelle": "bewertung",
     "complianceFlags": []
    }
   ],
   "hooks": [
    "Gekauft wegen der Optik. Wiedergekauft wegen allem anderen.",
    "Das Design, das in Reviews am häufigsten genannt wird.",
    "„Farbe Terracotta ist ein Traum und deutlich wärmer als auf dem Bildschirm.\""
   ],
   "score": 35
  },
  {
   "title": "Funktion im Alltag",
   "theme": "funktion_alltag",
   "mentions": 20,
   "sharePct": 9,
   "positivePct": 60,
   "trend": "unklar",
   "quotes": [
    {
     "text": "Endlich mal ein Bralette, bei dem der Unterbrustgummi nicht hochrutscht sobald ich die Arme hebe. Habe im Büro den ganzen Tag getestet.",
     "date": "2026-03-03",
     "rating": 5,
     "quelle": "bewertung",
     "complianceFlags": []
    },
    {
     "text": "Trage es unter dem Hemd bei 32 Grad, kein Kleben, kein Jucken. Kann ich für den Sommer klar empfehlen.",
     "date": "2026-07-14",
     "rating": 5,
     "quelle": "bewertung",
     "complianceFlags": []
    },
    {
     "text": "Ich schwitze schnell und trage viel Synthetik im Büro. Hier bleibt es trocken, das war für mich der Unterschied.",
     "date": "2026-03-02",
     "rating": 5,
     "quelle": "bewertung",
     "complianceFlags": []
    },
    {
     "text": "Sieht unter weissen Blusen nicht durch, das war mein Hauptkriterium.",
     "date": "2025-07-31",
     "rating": 5,
     "quelle": "bewertung",
     "complianceFlags": []
    },
    {
     "text": "Zeichnet sich unter einem engen Kleid nicht ab. Getestet auf einer Hochzeit, also unter Beobachtung.",
     "date": "2025-10-29",
     "rating": 5,
     "quelle": "bewertung",
     "complianceFlags": []
    }
   ],
   "hooks": [
    "Trägt sich so, dass man es abends vergisst auszuziehen.",
    "Der Alltagstest, den keine Produktseite ersetzen kann.",
    "„Endlich mal ein Bralette, bei dem der Unterbrustgummi nicht hochrutscht sobald i…\""
   ],
   "score": 35
  },
  {
   "title": "Preis & Wert",
   "theme": "preis_wert",
   "mentions": 21,
   "sharePct": 9,
   "positivePct": 48,
   "trend": "unklar",
   "quotes": [
    {
     "text": "Habe im Laden bei einer bekannten Kette das Gleiche für 12 Euro angefasst. Man merkt sofort wo der Unterschied liegt.",
     "date": "2026-02-13",
     "rating": 5,
     "quelle": "bewertung",
     "complianceFlags": []
    },
    {
     "text": "Nicht günstig. Ich habe trotzdem nachgekauft, und das ist bei mir selten.",
     "date": "2025-09-15",
     "rating": 5,
     "quelle": "bewertung",
     "complianceFlags": []
    },
    {
     "text": "39 Euro für einen Slip ist viel. Ich rechne aber mittlerweile in Trägetagen und da geht es auf.",
     "date": "2026-05-13",
     "rating": 4,
     "quelle": "bewertung",
     "complianceFlags": []
    },
    {
     "text": "Der Preis hat mich zwei Wochen zögern lassen. Rückblickend hätte ich es sofort kaufen sollen.",
     "date": "2026-03-22",
     "rating": 5,
     "quelle": "bewertung",
     "complianceFlags": []
    },
    {
     "text": "Habe im Sale zugeschlagen und würde jetzt auch zum Vollpreis wieder kaufen.",
     "date": "2026-07-12",
     "rating": 5,
     "quelle": "bewertung",
     "complianceFlags": []
    }
   ],
   "hooks": [
    "Teurer als im Discounter. Und trotzdem kaufen sie wieder. Warum?",
    "Was Kunden über den Preis sagen, wenn man sie nicht fragt.",
    "„Habe im Laden bei einer bekannten Kette das Gleiche für 12 Euro angefasst. Man m…\""
   ],
   "score": 32
  },
  {
   "title": "Nachhaltigkeit",
   "theme": "nachhaltigkeit",
   "mentions": 7,
   "sharePct": 3,
   "positivePct": 57,
   "trend": "unklar",
   "quotes": [
    {
     "text": "Gekommen wegen dem Gewissen, geblieben wegen dem Komfort. So müsste das immer laufen.",
     "date": "2025-09-15",
     "rating": 5,
     "quelle": "bewertung",
     "complianceFlags": []
    },
    {
     "text": "nachhaltig UND bequem gibts selten. hier passt es",
     "date": "2026-05-14",
     "rating": 5,
     "quelle": "bewertung",
     "complianceFlags": []
    },
    {
     "text": "Toll dass die Wäsche klimaneutral produziert wird, das war für mich der Ausschlag.",
     "date": "2025-12-13",
     "rating": 5,
     "quelle": "bewertung",
     "complianceFlags": [
      "klimaneutral"
     ]
    },
    {
     "text": "Die Verpackung ist komplett plastikfrei, sogar das Klebeband ist Papier. Kleine Sache, fällt mir aber auf.",
     "date": "2026-06-06",
     "rating": 5,
     "quelle": "bewertung",
     "complianceFlags": [
      "plastikfrei"
     ]
    }
   ],
   "hooks": [
    "Warum Kunden bleiben, nachdem sie wegen Nachhaltigkeit kamen.",
    "Gewissen ist der Einstieg. Komfort ist der Grund fürs Wiederkommen.",
    "„Gekommen wegen dem Gewissen, geblieben wegen dem Komfort. So müsste das immer la…\""
   ],
   "score": 11
  },
  {
   "title": "Geschenk & Anlass",
   "theme": "geschenk_anlass",
   "mentions": 7,
   "sharePct": 3,
   "positivePct": 57,
   "trend": "unklar",
   "quotes": [
    {
     "text": "Für meine Schwester zum Geburtstag gekauft. Sie hat sich am nächsten Tag selbst zwei nachbestellt.",
     "date": "2026-03-27",
     "rating": 5,
     "quelle": "bewertung",
     "complianceFlags": []
    },
    {
     "text": "Als Geschenk für meine Frau, sie war begeistert und ich bin jetzt kurzzeitig der Held.",
     "date": "2026-02-17",
     "rating": 5,
     "quelle": "bewertung",
     "complianceFlags": []
    },
    {
     "text": "Verschenkt und dann heimlich selbst anprobiert. Jetzt haben wir beide eins.",
     "date": "2025-10-13",
     "rating": 5,
     "quelle": "bewertung",
     "complianceFlags": []
    },
    {
     "text": "Geschenkverpackung war schön, aber 4,90 extra dafür finde ich happig.",
     "date": "2026-01-30",
     "rating": 4,
     "quelle": "bewertung",
     "complianceFlags": []
    }
   ],
   "hooks": [
    "Das Geschenk, das laut Reviews wirklich ankommt.",
    "Verschenkt. Und dann selbst nachbestellt.",
    "„Für meine Schwester zum Geburtstag gekauft. Sie hat sich am nächsten Tag selbst …\""
   ],
   "score": 11
  }
 ],
 "objections": [
  {
   "summary": "Kritik: Passform & Sitz",
   "mentions": 13,
   "quotes": [
    {
     "text": "Ich habe 75B und finde normalerweise nie was, das ohne Bügel hält. Das hier hält. Keine Ahnung wie, aber es hält.",
     "date": "2026-02-25",
     "rating": 5,
     "quelle": "bewertung",
     "complianceFlags": []
    },
    {
     "text": "Sitzt gut, aber die Träger sind mir persönlich einen Hauch zu lang. Kann man verstellen, also kein Drama.",
     "date": "2025-06-14",
     "rating": 4,
     "quelle": "bewertung",
     "complianceFlags": []
    },
    {
     "text": "Der Beinausschnitt beim Slip liegt flach an und rollt sich nicht ein. Klingt nach einer Kleinigkeit, ist aber genau das was mich sonst immer stört.",
     "date": "2026-03-25",
     "rating": 5,
     "quelle": "bewertung",
     "complianceFlags": []
    }
   ],
   "counterQuotes": [
    {
     "text": "Ich trage sonst ausschliesslich Calida und wollte eigentlich nur mal vergleichen. Der Sitz ist hier ehrlich gesagt besser.",
     "date": "2025-06-26",
     "rating": 5,
     "quelle": "bewertung",
     "complianceFlags": []
    },
    {
     "text": "Nach dem Waschen sitzt es genauso wie vorher, das ist bei mir bisher bei keinem Bralette so gewesen.",
     "date": "2025-08-05",
     "rating": 5,
     "quelle": "bewertung",
     "complianceFlags": []
    },
    {
     "text": "Bin 1,80m und habe lange Probleme mit zu kurzen Oberteilen. Der Body sitzt in der Länge tatsächlich richtig.",
     "date": "2026-05-31",
     "rating": 5,
     "quelle": "bewertung",
     "complianceFlags": []
    }
   ]
  },
  {
   "summary": "Kritik: Größe & Erwartung",
   "mentions": 6,
   "quotes": [
    {
     "text": "Bin zwischen zwei Größen und habe die kleinere genommen. Fehler.",
     "date": "2026-03-23",
     "rating": 2,
     "quelle": "bewertung",
     "complianceFlags": []
    },
    {
     "text": "Der Slip passt, das Bralette war zu klein. Innerhalb einer Marke hätte ich mit gleicher Größe gerechnet.",
     "date": "2026-02-22",
     "rating": 3,
     "quelle": "bewertung",
     "complianceFlags": []
    },
    {
     "text": "zu klein. schade. rückgabe war aber einfach",
     "date": "2026-07-12",
     "rating": 2,
     "quelle": "bewertung",
     "complianceFlags": []
    }
   ],
   "counterQuotes": [
    {
     "text": "Ich würde jedem raten, im Zweifel die größere Größe zu nehmen. Bei mir war es genau der Unterschied.",
     "date": "2025-06-01",
     "rating": 4,
     "quelle": "bewertung",
     "complianceFlags": []
    },
    {
     "text": "Habe nach der Größenberatung im Chat bestellt und es hat auf Anhieb gepasst. Ohne die Beratung hätte ich falsch gegriffen.",
     "date": "2026-04-16",
     "rating": 5,
     "quelle": "bewertung",
     "complianceFlags": []
    },
    {
     "text": "Größe zwischen zwei — Ich liege zwischen S und M. Was empfehlen Sie? Ich möchte nicht wieder zurückschicken müssen.",
     "date": "2026-02-27",
     "quelle": "support",
     "complianceFlags": []
    }
   ]
  },
  {
   "summary": "Kritik: Preis & Wert",
   "mentions": 5,
   "quotes": [
    {
     "text": "39 Euro für einen Slip ist viel. Ich rechne aber mittlerweile in Trägetagen und da geht es auf.",
     "date": "2026-05-13",
     "rating": 4,
     "quelle": "bewertung",
     "complianceFlags": []
    },
    {
     "text": "Teuer, aber ich kaufe seltener und ärgere mich weniger. Rechnet sich für mich.",
     "date": "2026-05-09",
     "rating": 5,
     "quelle": "bewertung",
     "complianceFlags": []
    },
    {
     "text": "ehrlich gesagt zu teuer für mich. produkt ist gut, nur nicht in meinem rahmen",
     "date": "2026-04-06",
     "rating": 3,
     "quelle": "bewertung",
     "complianceFlags": []
    }
   ],
   "counterQuotes": [
    {
     "text": "Habe im Laden bei einer bekannten Kette das Gleiche für 12 Euro angefasst. Man merkt sofort wo der Unterschied liegt.",
     "date": "2026-02-13",
     "rating": 5,
     "quelle": "bewertung",
     "complianceFlags": []
    },
    {
     "text": "Nach dem dritten Waschen war ein Faden lose. Habe ihn abgeschnitten, seitdem nichts mehr. Trotzdem erwähnenswert.",
     "date": "2026-06-26",
     "rating": 4,
     "quelle": "bewertung",
     "complianceFlags": []
    },
    {
     "text": "Nicht günstig. Ich habe trotzdem nachgekauft, und das ist bei mir selten.",
     "date": "2025-09-15",
     "rating": 5,
     "quelle": "bewertung",
     "complianceFlags": []
    }
   ]
  },
  {
   "summary": "Kritik: Service & Versand",
   "mentions": 4,
   "quotes": [
    {
     "text": "Ich habe drei verschiedene Größen bestellt weil ich unsicher war. M war richtig. Retoure der anderen beiden ging problemlos.",
     "date": "2026-06-24",
     "rating": 5,
     "quelle": "bewertung",
     "complianceFlags": []
    },
    {
     "text": "Die Verpackung ist komplett plastikfrei, sogar das Klebeband ist Papier. Kleine Sache, fällt mir aber auf.",
     "date": "2026-06-06",
     "rating": 5,
     "quelle": "bewertung",
     "complianceFlags": [
      "plastikfrei"
     ]
    },
    {
     "text": "Retoure war in drei Tagen erledigt und das Geld direkt zurück. So macht Umtauschen fast Spass.",
     "date": "2025-06-19",
     "rating": 5,
     "quelle": "bewertung",
     "complianceFlags": []
    }
   ],
   "counterQuotes": [
    {
     "text": "Kleine Löcher an der Seitennaht nach etwa einem halben Jahr. Support hat sofort ersetzt, deshalb trotzdem vier Sterne.",
     "date": "2025-12-04",
     "rating": 4,
     "quelle": "bewertung",
     "complianceFlags": []
    },
    {
     "text": "Habe am Sonntag geschrieben und Montag früh eine Antwort von einem Menschen bekommen, nicht von einem Bot.",
     "date": "2026-02-02",
     "rating": 5,
     "quelle": "bewertung",
     "complianceFlags": []
    },
    {
     "text": "Versand hat neun Tage gedauert, das war zu lang. Produkt selbst ist super, deshalb drei Sterne.",
     "date": "2026-06-04",
     "rating": 3,
     "quelle": "bewertung",
     "complianceFlags": []
    }
   ]
  },
  {
   "summary": "Kritik: Material & Haptik",
   "mentions": 3,
   "quotes": [
    {
     "text": "Der Stoff ist so weich, dass ich beim Auspacken kurz gelacht habe. Das ist nämlich albern, aber ich habe es tatsächlich erst an die Wange gehalten.",
     "date": "2026-04-22",
     "rating": 5,
     "quelle": "bewertung",
     "complianceFlags": []
    },
    {
     "text": "Sehr weich, aber nach der zweiten Wäsche fühlt es sich einen Hauch rauer an als am Anfang. Immer noch gut, nur nicht mehr ganz so.",
     "date": "2025-12-08",
     "rating": 4,
     "quelle": "bewertung",
     "complianceFlags": []
    },
    {
     "text": "Angenehmer Stoff, aber er nimmt Fusseln von dunklen Pullis an. Muss man wissen.",
     "date": "2025-07-05",
     "rating": 4,
     "quelle": "bewertung",
     "complianceFlags": []
    }
   ],
   "counterQuotes": [
    {
     "text": "Hatte erst Sorge dass es zu locker ist weil es sich so weich anfühlt. Falscher Alarm, der Halt ist da.",
     "date": "2025-10-23",
     "rating": 5,
     "quelle": "bewertung",
     "complianceFlags": []
    },
    {
     "text": "Kratzt nicht, pieksen tut auch nichts, und das Etikett ist aufgedruckt statt eingenäht. Wer sowas entscheidet, hat verstanden.",
     "date": "2026-04-10",
     "rating": 5,
     "quelle": "bewertung",
     "complianceFlags": []
    },
    {
     "text": "Das Material ist deutlich dicker als erwartet, im positiven Sinne. Fühlt sich nicht nach Wegwerfware an.",
     "date": "2025-08-24",
     "rating": 5,
     "quelle": "bewertung",
     "complianceFlags": []
    }
   ]
  },
  {
   "summary": "Kritik: Sonstiges",
   "mentions": 3,
   "quotes": [
    {
     "text": "Der Unterschied zu meinem alten Set ist so gross, dass ich das alte direkt in die Altkleidersammlung gegeben habe.",
     "date": "2026-01-26",
     "rating": 5,
     "quelle": "bewertung",
     "complianceFlags": []
    },
    {
     "text": "Ich dachte das ist made in Germany? Auf dem Etikett steht Portugal. Nicht schlimm, aber ich hatte es anders verstanden.",
     "date": "2026-05-16",
     "rating": 4,
     "quelle": "bewertung",
     "complianceFlags": [
      "made_in_germany"
     ]
    },
    {
     "text": "Liebevoll verpackt mit einer handgeschriebenen Karte. Ich weiss, das skaliert nicht, aber es hat gewirkt.",
     "date": "2025-12-13",
     "rating": 5,
     "quelle": "bewertung",
     "complianceFlags": []
    }
   ],
   "counterQuotes": [
    {
     "text": "Bei grosser Oberweite (80D) meistens ein Problem: entweder Halt oder Komfort. Hier zum ersten Mal beides gleichzeitig.",
     "date": "2026-03-12",
     "rating": 5,
     "quelle": "bewertung",
     "complianceFlags": []
    },
    {
     "text": "ich hasse unterwäsche shopping und das hier hat es tatsächlich erledigt",
     "date": "2025-08-12",
     "rating": 5,
     "quelle": "bewertung",
     "complianceFlags": []
    },
    {
     "text": "Seit März im Wechsel mit zwei anderen, also grob 40 Waschgänge. Sieht aus wie am ersten Tag.",
     "date": "2026-01-23",
     "rating": 5,
     "quelle": "bewertung",
     "complianceFlags": []
    }
   ]
  },
  {
   "summary": "Kritik: Optik & Design",
   "mentions": 3,
   "quotes": [
    {
     "text": "sehr elegant für etwas das keiner sieht. ich weiss es aber",
     "date": "2025-12-17",
     "rating": 5,
     "quelle": "bewertung",
     "complianceFlags": []
    },
    {
     "text": "Ich fühle mich darin schlicht besser. Klingt kitschig, ist aber der Hauptgrund für den Wiederkauf.",
     "date": "2026-03-26",
     "rating": 5,
     "quelle": "bewertung",
     "complianceFlags": []
    },
    {
     "text": "Geschenkverpackung war schön, aber 4,90 extra dafür finde ich happig.",
     "date": "2026-01-30",
     "rating": 4,
     "quelle": "bewertung",
     "complianceFlags": []
    }
   ],
   "counterQuotes": [
    {
     "text": "Farbe Terracotta ist ein Traum und deutlich wärmer als auf dem Bildschirm.",
     "date": "2025-06-24",
     "rating": 5,
     "quelle": "bewertung",
     "complianceFlags": []
    },
    {
     "text": "Ich habe das erste Teil vor 14 Monaten gekauft und trage es noch. Die Farbe ist minimal blasser, die Form komplett erhalten.",
     "date": "2025-11-24",
     "rating": 5,
     "quelle": "bewertung",
     "complianceFlags": []
    },
    {
     "text": "Sitzt so gut dass ich zwei weitere in anderen Farben bestellt habe, bevor ich diese Bewertung geschrieben habe.",
     "date": "2026-07-08",
     "rating": 5,
     "quelle": "bewertung",
     "complianceFlags": []
    }
   ]
  },
  {
   "summary": "Kritik: Haltbarkeit & Qualität",
   "mentions": 2,
   "quotes": [
    {
     "text": "Nach etwa 20 Wäschen leichtes Pilling am Bund. Nicht dramatisch, aber bei 39 Euro hatte ich es nicht erwartet.",
     "date": "2026-04-28",
     "rating": 3,
     "quelle": "bewertung",
     "complianceFlags": []
    },
    {
     "text": "Peinlich aber wahr: Ich habe Wäschekauf jahrelang gehasst wie Steuererklärung. Das hier war der erste Kauf, der Spass gemacht hat.",
     "date": "2025-07-13",
     "rating": 5,
     "quelle": "bewertung",
     "complianceFlags": []
    }
   ],
   "counterQuotes": [
    {
     "text": "Nach dem Waschen sitzt es genauso wie vorher, das ist bei mir bisher bei keinem Bralette so gewesen.",
     "date": "2025-08-05",
     "rating": 5,
     "quelle": "bewertung",
     "complianceFlags": []
    },
    {
     "text": "wäsche bei 30 grad, trocknen an der luft, nach einem jahr noch top",
     "date": "2026-07-16",
     "rating": 5,
     "quelle": "bewertung",
     "complianceFlags": []
    },
    {
     "text": "Kleine Löcher an der Seitennaht nach etwa einem halben Jahr. Support hat sofort ersetzt, deshalb trotzdem vier Sterne.",
     "date": "2025-12-04",
     "rating": 4,
     "quelle": "bewertung",
     "complianceFlags": []
    }
   ]
  }
 ],
 "scrollstoppers": [
  {
   "text": "Ich trage sonst ausschliesslich Calida und wollte eigentlich nur mal vergleichen. Der Sitz ist hier ehrlich gesagt besser.",
   "date": "2025-06-26",
   "rating": 5,
   "quelle": "bewertung",
   "complianceFlags": []
  },
  {
   "text": "Kleiner Tipp: kauft nicht nur eins. Sonst ist Waschtag ein emotionales Problem.",
   "date": "2025-07-09",
   "rating": 5,
   "quelle": "bewertung",
   "complianceFlags": []
  },
  {
   "text": "was soll ich sagen. ich habe es angezogen und wollte es nicht mehr ausziehen. mein freund fand das weniger praktisch",
   "date": "2026-02-22",
   "rating": 5,
   "quelle": "bewertung",
   "complianceFlags": []
  },
  {
   "text": "ehrlich gesagt zu teuer für mich. produkt ist gut, nur nicht in meinem rahmen",
   "date": "2026-04-06",
   "rating": 3,
   "quelle": "bewertung",
   "complianceFlags": []
  },
  {
   "text": "Mein Mann hat gefragt ob ich beim Friseur war. Nein. Neue Unterwäsche.",
   "date": "2025-10-21",
   "rating": 5,
   "quelle": "bewertung",
   "complianceFlags": []
  },
  {
   "text": "Peinlich aber wahr: Ich habe Wäschekauf jahrelang gehasst wie Steuererklärung. Das hier war der erste Kauf, der Spass gemacht hat.",
   "date": "2025-07-13",
   "rating": 5,
   "quelle": "bewertung",
   "complianceFlags": []
  }
 ],
 "wording": {
  "kunden": [
   {
    "word": "passt",
    "count": 13
   },
   {
    "word": "sitzt",
    "count": 12
   },
   {
    "word": "bestellt",
    "count": 12
   },
   {
    "word": "hält",
    "count": 10
   },
   {
    "word": "größe",
    "count": 10
   },
   {
    "word": "slip",
    "count": 8
   },
   {
    "word": "gibt",
    "count": 8
   },
   {
    "word": "bralette",
    "count": 6
   },
   {
    "word": "danke",
    "count": 6
   },
   {
    "word": "preis",
    "count": 6
   },
   {
    "word": "geht",
    "count": 6
   },
   {
    "word": "farbe",
    "count": 6
   },
   {
    "word": "steht",
    "count": 6
   },
   {
    "word": "viel",
    "count": 5
   },
   {
    "word": "weich",
    "count": 5
   },
   {
    "word": "bequem",
    "count": 5
   },
   {
    "word": "lange",
    "count": 5
   },
   {
    "word": "seite",
    "count": 5
   },
   {
    "word": "fühlt",
    "count": 5
   },
   {
    "word": "wochen",
    "count": 5
   },
   {
    "word": "deutlich",
    "count": 5
   },
   {
    "word": "wäsche",
    "count": 5
   },
   {
    "word": "euro",
    "count": 5
   },
   {
    "word": "gekauft",
    "count": 5
   },
   {
    "word": "trotzdem",
    "count": 5
   },
   {
    "word": "fällt",
    "count": 5
   },
   {
    "word": "nummer",
    "count": 5
   },
   {
    "word": "klein",
    "count": 5
   },
   {
    "word": "bügel",
    "count": 4
   },
   {
    "word": "besser",
    "count": 4
   }
  ]
 },
 "quellenSplit": [
  {
   "quelle": "bewertung",
   "count": 149,
   "positivPct": 90
  },
  {
   "quelle": "support",
   "count": 40,
   "positivPct": 3
  },
  {
   "quelle": "kommentar",
   "count": 40,
   "positivPct": 8
  }
 ],
 "quellenluecken": [
  {
   "theme": "groesse_erwartung",
   "jeQuelle": [
    {
     "quelle": "support",
     "nennungen": 9,
     "anteilPct": 23,
     "positivPct": 11
    },
    {
     "quelle": "kommentar",
     "nennungen": 5,
     "anteilPct": 13,
     "positivPct": 0
    },
    {
     "quelle": "bewertung",
     "nennungen": 10,
     "anteilPct": 7,
     "positivPct": 20
    }
   ],
   "mehrAlsBewertungen": 16,
   "auffaelligste": "support",
   "quotes": [
    {
     "text": "welche Größe — Ich bin 80C. Welche Größe brauche ich bei Ihnen? Auf der Seite finde ich dazu nichts Eindeutiges.",
     "date": "2026-06-13",
     "quelle": "support",
     "complianceFlags": []
    },
    {
     "text": "Größe zu klein — Hallo, ich habe M bestellt laut Ihrer Tabelle, das passt aber überhaupt nicht. Kann ich L tauschen?",
     "date": "2026-02-10",
     "quelle": "support",
     "complianceFlags": []
    },
    {
     "text": "Umtausch Größe — Ich brauche eine Nummer größer. Wie geht der Umtausch?",
     "date": "2026-01-23",
     "quelle": "support",
     "complianceFlags": []
    }
   ]
  },
  {
   "theme": "service_versand",
   "jeQuelle": [
    {
     "quelle": "support",
     "nennungen": 8,
     "anteilPct": 20,
     "positivPct": 0
    },
    {
     "quelle": "kommentar",
     "nennungen": 3,
     "anteilPct": 8,
     "positivPct": 33
    },
    {
     "quelle": "bewertung",
     "nennungen": 10,
     "anteilPct": 7,
     "positivPct": 80
    }
   ],
   "mehrAlsBewertungen": 13,
   "auffaelligste": "support",
   "quotes": [
    {
     "text": "Lieferung — Bestellung vom 3. ist noch nicht da. Sendungsverfolgung zeigt seit vier Tagen keine Änderung.",
     "date": "2026-03-28",
     "quelle": "support",
     "complianceFlags": []
    },
    {
     "text": "Umtausch dauert — Mein Umtausch ist seit zwei Wochen unterwegs. Wo bleibt das Ersatzteil?",
     "date": "2025-06-26",
     "quelle": "support",
     "complianceFlags": []
    },
    {
     "text": "Umtausch Größe — Ich brauche eine Nummer größer. Wie geht der Umtausch?",
     "date": "2026-01-23",
     "quelle": "support",
     "complianceFlags": []
    }
   ]
  },
  {
   "theme": "haltbarkeit",
   "jeQuelle": [
    {
     "quelle": "support",
     "nennungen": 6,
     "anteilPct": 15,
     "positivPct": 0
    },
    {
     "quelle": "bewertung",
     "nennungen": 14,
     "anteilPct": 9,
     "positivPct": 93
    }
   ],
   "mehrAlsBewertungen": 6,
   "auffaelligste": "support",
   "quotes": [
    {
     "text": "Pilling — Nach etwa 15 Wäschen bildet sich am Bund Pilling. Ist das normal bei dem Preis?",
     "date": "2026-07-05",
     "quelle": "support",
     "complianceFlags": []
    },
    {
     "text": "Waschen — Kann ich das in den Trockner? Auf dem Etikett steht ein Symbol, das ich nicht kenne.",
     "date": "2025-11-01",
     "quelle": "support",
     "complianceFlags": []
    },
    {
     "text": "Naht offen — Bei einem Teil ist nach drei Wochen die Seitennaht aufgegangen. Foto im Anhang.",
     "date": "2025-08-02",
     "quelle": "support",
     "complianceFlags": []
    }
   ]
  }
 ],
 "taggedBy": "heuristik",
 "llmEnhanced": false
};
