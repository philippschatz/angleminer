# Angle Miner — V1

**„2.000 Kundenbewertungen rein, 10 belegte Ad-Angles raus."**
Reviews-CSV hochladen → kostenlose Vorschau → 49 € via Stripe → voller Report (Angle-Map, Objection-Bank, Scrollstopper, Kundenwording) als Web-Report + PDF.

## Architektur in 30 Sekunden

```
Upload (CSV/Paste)
  → parse.ts    Spalten-Heuristik (Judge.me, Yotpo, Loox, Trustpilot, Trusted Shops, Amazon)
  → clean.ts    Dedupe · Junk-Filter · PII-Scrub · Seeding-Gegenprobe (≥20× identisch ⇒ Warnung im Report)
  → tagger.ts   Heuristik sofort (Vorschau, kostenlos) · LLM-Tagging nach Zahlung (Claude, 40er-Batches)
  → aggregate.ts  ALLE Zahlen deterministisch in Code — das LLM zählt nie
  → enhance.ts  Ein LLM-Call: Angle-Titel in Kundensprache + Hooks (Zahlen bleiben unangetastet)
  → Report      /r/[id] · Vorschau (Angle 1 + Locked Sections) vs. voll (nach Zahlung)
```

Zahlungsflow: `/api/checkout` (Stripe Checkout, Report-ID in Metadata) → Webhook `/api/stripe-webhook` schaltet frei → `/api/process` upgraded den Report von Heuristik auf LLM (Client pollt `/api/status`). Fallback: Success-URL verifiziert die Session direkt, falls der Webhook lahmt. Rohdaten werden nach der Verarbeitung gelöscht.

## Lokal starten

```bash
npm install
node scripts/make-demo-data.mjs   # synthetische Demo-Reviews erzeugen
npx tsx scripts/seed-demo.ts      # Beispiel-Report unter /r/demo seeden
npm run dev                       # http://localhost:3000
```

Ohne Keys läuft alles im Dev-Modus: Heuristik-Analyse, simulierter Kauf. Der komplette Flow (Upload → Vorschau → „Kauf" → voller Report) ist so testbar.

## Deployment (Vercel, ~30 Minuten)

1. **Repo pushen**, in Vercel importieren.
2. **Postgres**: Supabase- oder Neon-Projekt anlegen, `DATABASE_URL` als Env-Var setzen (Tabelle wird beim ersten Zugriff automatisch angelegt).
3. **Anthropic**: API-Key erzeugen, `ANTHROPIC_API_KEY` setzen. Kosten: grob 2–5 € pro 2.000-Review-Report (Haiku fürs Tagging, ein Sonnet-Call fürs Finishing).
4. **Stripe**: Produkt brauchst du nicht anzulegen (Preis wird per `price_data` erzeugt). `STRIPE_SECRET_KEY` setzen. Webhook-Endpoint `https://DEINE-DOMAIN/api/stripe-webhook` mit Event `checkout.session.completed` anlegen, `STRIPE_WEBHOOK_SECRET` setzen. Stripe Tax aktivieren und `STRIPE_AUTOMATIC_TAX=1` (B2B/B2C-USt!).
5. `NEXT_PUBLIC_BASE_URL` auf die Domain setzen.
6. **Demo-Report in Prod seeden**: lokal `DATABASE_URL=<prod-url> npx tsx scripts/seed-demo.ts` — oder mit einem echten (anonymisierten) Datensatz statt der Synthetik.
7. Vercel-Funktion `/api/process` braucht `maxDuration: 300` (gesetzt) — auf dem Hobby-Plan sind nur 60 s erlaubt, also Pro-Plan oder Review-Cap senken.

## Preis / Produktlogik

- 49 € pro Report (bis 5.000 Reviews), Einmalzahlung, keine Trials — Vorschau ist das Verkaufsargument.
- Vorschau kostet dich nichts (Heuristik, kein LLM-Call) → kein Abuse-Risiko beim Gratis-Schritt.
- Mindestens 30 Reviews, sonst lehnt die App ehrlich ab.
- Compliance-Flags (Klima-/Herkunfts-/Siegel-Claims in Zitaten) werden markiert: „nicht 1:1 in Ads übernehmen".

## Bewusst NICHT in V1

Accounts/Login · Credits/Packs · TikTok/Shop-APIs · Abo · Team-Features · EN-Version.
Alles davon erst bauen, wenn zahlende Kunden es verlangen.

## Nächste sinnvolle Schritte

1. Namen/Domain festmachen (aktuell Working Title „Angle Miner").
2. Demo-Report mit echten (anonymisierten) Daten ersetzen — die Synthetik ist als Demo gekennzeichnet.
3. Impressum/Datenschutz/AGB ergänzen (Pflicht vor Launch, DE).
4. Refresh-Report (19 €) und Agentur-Pack als Stripe-Varianten.
5. E-Mail-Versand des Report-Links (aktuell nur URL).
