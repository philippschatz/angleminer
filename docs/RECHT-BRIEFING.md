# Briefing für die Kanzlei — Angle Miner

Diese Unterlage beschreibt das Produkt und sämtliche Datenflüsse, damit die
Rechtstexte nicht aus dem Nichts entstehen müssen. Sie ist von einem
Entwicklungsassistenten aus dem tatsächlichen Programmcode zusammengestellt,
**nicht** von einem Juristen — sie ersetzt keine Prüfung, sie soll sie abkürzen.

Stand: 15.08.2026

---

## 1. Was das Produkt tut

Betreiber verkauft eine Web-Anwendung an Marken im Online-Handel (Zielgruppe DACH,
überwiegend Deutschland).

Ablauf aus Kundensicht:
1. Kunde lädt einen Datei-Export seiner Produktbewertungen hoch.
2. Er sieht sofort eine kostenlose Vorschau der Auswertung.
3. Für 49 € (einmalig, kein Abo) schaltet er die vollständige Auswertung frei.
4. Die Auswertung nennt Themen, Häufigkeiten und wörtliche Zitate aus den Bewertungen,
   damit er daraus Werbetexte entwickeln kann.

Es gibt kein Abonnement, keine Anbindung an fremde Plattformen und keine
Weitergabe von Daten an Dritte zu eigenen Zwecken.

---

## 2. Die zentrale Frage: Rollenverteilung

Es fallen **zwei** getrennte Arten personenbezogener Daten an.

**a) Daten der zahlenden Kunden** (deren E-Mail-Adresse, Zahlungsdaten)
→ Betreiber ist hier nach unserem Verständnis **Verantwortlicher**.

**b) Daten in den hochgeladenen Bewertungen** — also Daten der *Endkunden des Kunden*
→ Hier verarbeitet der Betreiber im Auftrag. Nach unserem Verständnis
**Auftragsverarbeitung nach Art. 28 DSGVO**, mit dem zahlenden Kunden als
Verantwortlichem.

**Daraus folgt:** Es wird ein AVV-Muster gebraucht, das der Kunde beim Kauf
abschließen kann. Bitte prüfen, ob diese Einordnung trägt.

---

## 3. Datenflüsse im Einzelnen

### 3.1 Vor dem Kauf — es verlässt nichts den Rechner des Kunden

Einlesen, Entdoppeln, Aussortieren und das Entfernen personenbezogener Angaben
laufen **vollständig im Browser des Kunden**. Es findet in dieser Phase
**keinerlei Übertragung** an den Betreiber statt. Wer nur die Vorschau ansieht
und nicht kauft, hinterlässt beim Betreiber nichts.

Automatisch entfernt werden dabei, noch auf dem Rechner des Kunden:
E-Mail-Adressen · Bestell- und Kundennummern · IBAN · Telefonnummern ·
Internetadressen · Namen der Bewertenden (vollständig).

### 3.2 Beim Kauf — was übertragen wird

Übertragen werden **ausschließlich** vier Angaben pro Bewertung:

| Feld | Inhalt |
|---|---|
| laufende Nummer | technische ID, kein Personenbezug |
| Text | der Bewertungstext, bereinigt wie oben |
| Sterne | Zahl 1–5 |
| Datum | Datum der Bewertung |

**Kein Name, kein Produktbezug, keine Kontaktdaten.**

Restrisiko, das bitte bewertet wird: Ein freier Bewertungstext kann trotz
Bereinigung Personenbezug enthalten („mein Mann Klaus fand…"). Wir gehen davon
aus, dass die Daten deshalb weiterhin als personenbezogen zu behandeln sind, und
haben sie entsprechend behandelt.

### 3.3 Was an die KI geht

Zur inhaltlichen Einordnung werden Bewertungen an Anthropic (USA) übermittelt,
in Paketen zu 40 Stück. Übermittelt werden dabei **nur** laufende Nummer, Text
und Sterne — **nicht** das Datum. Die Daten werden nicht zum Training verwendet
(bitte gegen den aktuellen Anthropic-Vertrag prüfen).

### 3.4 Speicherdauern

| Was | Wie lange |
|---|---|
| Hochgeladene Bewertungen (Rohdaten) | bis zur fertigen Auswertung, dann sofortige Löschung |
| Abgebrochene Käufe (bezahlt wurde nie) | 24 Stunden, dann vollständige Löschung |
| Zitate in fertigen Auswertungen | bis 24 Monate ohne Anmeldung des Kunden, dann Entfernung |
| Auswertungszahlen ohne Zitate | unbegrenzt (aggregiert, aus unserer Sicht ohne Personenbezug) |
| E-Mail-Adresse des Kunden, Konto | unbegrenzt — **hier fehlt bisher ein Löschkonzept, siehe Frage 6** |
| Anmelde-Token | 30 Minuten, danach automatische Löschung |
| Sitzungs-Cookie | 90 Tage, technisch notwendig, signiert |
| Einwilligungsnachweis Werbung | siehe Frage 5 |

### 3.5 Werbe-Einwilligung

Umgesetzt als Double-Opt-in: nie vorangehaktes Kästchen, danach
Bestätigungsmail, erst der Klick zählt. Gespeichert werden Zeitpunkt der
Anfrage, Zeitpunkt der Bestätigung, Zeitpunkt eines Widerrufs sowie die Quelle
(Kauf oder Vorschau). Abmeldelink ohne Rückfrage vorhanden.

Mails zur Vertragsabwicklung (Anmeldelink, fertige Auswertung, Erstattung)
laufen davon getrennt und enthalten keine Werbung.

---

## 4. Eingesetzte Dienstleister

| Dienstleister | Zweck | Sitz | Verarbeitungsort |
|---|---|---|---|
| Vercel Inc. | Hosting der Anwendung | USA | Frankfurt (fest eingestellt) |
| Neon bzw. Supabase | Datenbank | USA / Irland | Frankfurt (bei Einrichtung wählen) |
| Anthropic PBC | KI-Auswertung der Texte | USA | **USA** |
| Stripe Payments Europe Ltd. | Zahlungsabwicklung | Irland | EU |
| Resend | Versand der Systemmails | USA | USA |

Der Betreiber sieht **keine** Kartendaten; die Zahlung läuft vollständig bei Stripe.

---

## 5. Benötigte Dokumente

1. **Impressum**
2. **Datenschutzerklärung** (beide Rollen abbilden: eigene Kundendaten und Auftragsverarbeitung)
3. **AGB** — inkl. der Frage zum Widerrufsrecht, siehe Frage 1
4. **AVV-Muster nach Art. 28**, das der Kunde beim Kauf abschließen kann,
   mit Unterauftragsverarbeiter-Liste aus Abschnitt 4
5. **Verzeichnis von Verarbeitungstätigkeiten**
6. Prüfung, ob eine **Datenschutz-Folgenabschätzung** nötig ist

---

## 6. Konkrete Fragen

**Frage 1 — Widerrufsrecht.** Verkauft wird ein digitales Produkt, das sofort
geliefert wird. Ein Teil der Käufer dürften Einzelunternehmer sein, die im
Zweifel als Verbraucher gelten. Braucht es vor dem Kaufabschluss ein
ausdrückliches Verlangen der sofortigen Ausführung samt Kenntnisnahme, dass das
Widerrufsrecht damit erlischt? **Falls ja, fehlt dieses Kästchen im Kaufvorgang
bisher und muss ergänzt werden.**

**Frage 2 — Rollenverteilung.** Trägt die Einordnung aus Abschnitt 2?

**Frage 3 — Drittlandübermittlung.** Genügen Vertrag und Zertifizierung von
Anthropic für die Übermittlung in die USA, oder ist eine Verarbeitung
innerhalb der EU nötig? *Technischer Hinweis: Ein Wechsel auf einen
EU-Verarbeitungsort wäre mit überschaubarem Aufwand möglich, der entsprechende
Aufruf ist bewusst an einer einzigen Stelle gekapselt.*

**Frage 4 — Informationspflicht.** Muss der Kunde seine eigenen Endkunden
darüber informieren, dass deren Bewertungen so ausgewertet werden? Falls ja:
Wir würden einen entsprechenden Hinweis in den AVV aufnehmen.

**Frage 5 — Einwilligungsnachweis.** Wie lange muss der Nachweis nach einem
Widerruf aufbewahrt werden, und was passiert danach?

**Frage 6 — Kontolöschung.** Bisher gibt es keine Selbstbedienungs-Löschung des
Kundenkontos. Ist eine solche erforderlich, und muss sie automatisch greifen
oder reicht eine Löschung auf Anfrage?

**Frage 7 — Zitate in Werbung.** Die Auswertung markiert Kundenzitate, die
rechtlich heikle Aussagen enthalten (Klima, Herkunft, Siegel, Gesundheit), mit
einer Warnung. Reicht dieser Hinweis zur Enthaftung, oder braucht es eine
weitergehende Regelung in den AGB?
