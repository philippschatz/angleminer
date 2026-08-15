# Angle Miner live schalten — Checkliste

Reihenfolge ist bewusst gewählt: Was lange dauert oder auf andere Dinge wartet, steht vorne.
Abhaken, was erledigt ist.

## Woche 1 — Dinge, die auf jemand anderen warten

- [ ] **Name festlegen und Domain kaufen** (~15 €/Jahr). Blockiert Stripe, Resend und die Rechtstexte.
- [ ] **Stripe-Konto anlegen und verifizieren.** Firmendaten, Ausweis, Bankverbindung. Die Prüfung dauert oft 1–2 Werktage — deshalb früh anstoßen.
- [ ] **Stripe Tax aktivieren** (Umsatzsteuer, bei DE/EU-Kunden Pflicht).
- [ ] **Rechtstexte beauftragen oder erstellen:** Impressum, Datenschutzerklärung, AGB. Dazu ein **Auftragsverarbeitungsvertrag (AVV)** — den werden deine Kunden verlangen, weil du Bewertungen ihrer Endkunden verarbeitest. Kein Generator-Text: Der AVV muss die Unterauftragsverarbeiter nennen (Vercel, Anthropic, Neon/Supabase, Stripe, Resend) und den US-Bezug von Anthropic ausweisen.

## Woche 1 — Konten, die du selbst in Minuten anlegst

- [ ] **GitHub-Konto**, Projekt hochladen (mache ich, wenn du das Konto hast).
- [ ] **Vercel-Konto, Pro-Tarif** (~20 $/Monat). Der kostenlose Tarif reicht nicht: Er begrenzt Funktionen auf 60 Sekunden und lässt den Zeitplan nur einmal täglich laufen.
- [ ] **Datenbank bei Neon oder Supabase** (Einstieg kostenlos). Region Frankfurt wählen.
- [ ] **Anthropic-Konto**, Guthaben aufladen, API-Schlüssel erzeugen. Rechne mit 2–5 € pro verkauftem Report.
- [ ] **Resend-Konto** (bis 3.000 Mails/Monat kostenlos). Dort deine Domain eintragen und die angezeigten DNS-Einträge beim Domain-Anbieter hinterlegen — sonst landen deine Mails im Spam.

## Woche 2 — Zusammenstecken

- [ ] **Zwei Geheimnisse erzeugen.** Im Terminal je einmal:
      `openssl rand -base64 32`
      Das erste wird `SESSION_SECRET`, das zweite `CRON_SECRET`.
- [ ] **Umgebungsvariablen in Vercel eintragen** (Settings → Environment Variables). Welche, steht in `.env.example`. Pflicht sind: `DATABASE_URL`, `ANTHROPIC_API_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_AUTOMATIC_TAX=1`, `RESEND_API_KEY`, `MAIL_FROM`, `SESSION_SECRET`, `CRON_SECRET`, `NEXT_PUBLIC_BASE_URL`.
- [ ] **Erstes Deployment.** Vercel baut automatisch, sobald das Projekt verbunden ist.
- [ ] **Stripe-Webhook einrichten:** Ziel `https://DEINE-DOMAIN/api/stripe-webhook`, Ereignis `checkout.session.completed`. Den dabei angezeigten Schlüssel als `STRIPE_WEBHOOK_SECRET` nachtragen und neu deployen.
- [ ] **Beispiel-Report einspielen**, sonst führt „Beispiel ansehen" ins Leere.
- [ ] **Rechtstexte als Seiten einbauen** und im Fußbereich verlinken (mache ich).

## Woche 2 — Prüfen, bevor echtes Geld fließt

- [ ] **Testkauf im Stripe-Testmodus** mit der Testkarte `4242 4242 4242 4242`.
- [ ] Kommt die Mail „Dein Report ist fertig" an? Nicht im Spam?
- [ ] Funktioniert der Anmeldelink, und liegt der Report danach im Konto?
- [ ] Funktioniert die Bestätigungsmail für den Newsletter?
- [ ] **Auf Stripe Live-Modus umstellen** und einen echten Kauf mit eigener Karte machen. Danach selbst erstatten.

## Laufende Kosten

| Posten | Kosten |
|---|---|
| Domain | ~15 € / Jahr |
| Vercel Pro | ~20 $ / Monat |
| Datenbank | kostenlos zum Start |
| Resend | kostenlos bis 3.000 Mails / Monat |
| Anthropic | 2–5 € pro verkauftem Report |
| Stripe | ~1,5 % + 0,25 € pro Zahlung, dazu Stripe Tax |

Fixkosten also rund 20–25 € im Monat. Der erste verkaufte Report deckt das.

## Was NICHT vergessen werden darf

Ohne `SESSION_SECRET` startet die Anwendung in Produktion absichtlich nicht — ohne ihn wäre die Anmeldung angreifbar.
Ohne `CRON_SECRET` könnte jeder die Zeitplan-Endpunkte auslösen.
Ohne `DATABASE_URL` würden alle Reports beim nächsten Neustart verschwinden.
