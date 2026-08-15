@AGENTS.md

# Angle Miner — Projektkontext für Claude Code

VoC-Micro-SaaS: Kunde lädt Review-CSV hoch → kostenlose Heuristik-Vorschau → 49 € Stripe Checkout → LLM-Tiefenanalyse → Report (Angle-Map, Objection-Bank, Scrollstopper, Wording-Lexikon). Solo-Projekt von Philipp, Ziel: wartungsarm, keine Plattform-APIs, kein Abo.

## Befehle

- `npm run dev` — Dev-Server (localhost:3000)
- `npm run build` — Build inkl. Typecheck (vor jedem Commit laufen lassen)
- `node scripts/make-demo-data.mjs` — synthetische Demo-Reviews erzeugen
- `npx tsx scripts/seed-demo.ts` — Beispiel-Report unter /r/demo seeden
- Ohne Env-Keys läuft alles im Dev-Modus: Kauf wird simuliert, Analyse heuristisch. Env-Vars: siehe `.env.example`, Deploy: siehe `README.md`.

## Architektur (Kurzfassung)

- `src/lib/pipeline/` — das Herz: `parse.ts` (CSV-Spalten-Heuristik) → `clean.ts` (Dedupe/Junk/PII/Seeding) → `tagger.ts` (regelbasiert, läuft auch im Browser) bzw. `tagger-llm.ts` (Claude-Batches, nur Server) → `aggregate.ts` (deterministische Zählung) → `enhance.ts` (ein LLM-Call für Titel/Hooks)
- `src/lib/pipeline/browser.ts` — fasst parse→clean→tagger→aggregate zu der Vorschau zusammen, die **im Browser des Kunden** läuft, und liefert daneben `upload[]` mit exakt den Feldern, die den Rechner verlassen dürfen: `id`, `text`, `rating`, `date`. Keine Namen, kein Produkt.
- `src/content/copy.ts` — **sämtliche** sichtbaren Texte. Nie Copy direkt in Komponenten schreiben.
- `src/lib/store.ts` — Storage-Adapter: Postgres via DATABASE_URL, sonst Dateisystem `.data/`
- API-Flow: `/api/report` (Kauf-Klick: bereinigte Daten rein, Report anlegen, Stripe-Session) · `/api/checkout` (Zweitversuch nach Abbruch, von `/r/[id]`) · `/api/stripe-webhook` (Zahlung) · `/api/process` (LLM-Upgrade nach Zahlung, maxDuration 300) · `/api/status` (Polling)
- Report-Gating in `src/app/r/[id]/page.tsx`: unbezahlt = Vorschau (Angle 1 + Locked Sections), bezahlt = voll. `ReportView` bekommt den Kauf-Button über die Prop `kaufBereich` — auf `/new` legt er den Report erst an, auf `/r/[id]` existiert er schon.

## User Journey (Stand 15.08.2026)

1. `/new` — Datei oder Text rein. Einlesen, Putzen, PII-Scrub und Gratis-Vorschau laufen **vollständig im Browser**. Kein Serverkontakt, keine Report-ID, kein Upload.
2. Klick auf „Freischalten" — **jetzt erst** gehen die bereinigten Bewertungen an `/api/report`. Bewusst vor der Weiterleitung zu Stripe, damit Gerätewechsel oder Abbruch die Analyse nicht vernichten. Daten abgebrochener Käufe werden nach 24 h weggeräumt (noch zu bauen).
3. Stripe → Webhook schaltet frei → Tiefenanalyse serverseitig (noch zu bauen: Anstoß per Webhook + Cron, gechunkt) → Zustellung per Mail.
4. Report lebt im Kundenkonto, das mit dem Kauf entsteht (noch zu bauen).

## Unverhandelbare Regeln

1. **Das LLM zählt nie.** Es taggt einzelne Reviews; alle Counts, Anteile, Trends und Rankings entstehen in `aggregate.ts` in Code. Beim Refactoring niemals Zählung/Ranking in einen Prompt verlagern.
2. **Cleaning ist ehrlich:** Entferntes (Junk, Duplikate, PII, Seeding-Verdacht) wird gezählt und im Report ausgewiesen, nie still verschluckt.
3. **PII-Scrub bleibt strikt:** nur Vornamen, E-Mails/Bestellnummern/IBANs/Telefonnummern/URLs raus. Rohdaten (`rawReviews`) werden nach dem LLM-Upgrade gelöscht.
4. **Compliance-Flags an Zitaten** (Klima/Herkunft/Siegel/Absolut/Heilversprechen) nie entfernen — Kundenzitate mit solchen Claims dürfen nie unmarkiert in den Report.
5. **Kein Abbruch im Kaufflow:** Schlägt das LLM-Upgrade fehl, bleibt der Heuristik-Report gültig (`status: ready`, degraded) — nie einen bezahlten Report kaputt hinterlassen.
6. **Keine neuen Pflicht-Abhängigkeiten** (Auth, fremde Plattform-APIs, Abo-Logik) ohne explizite Entscheidung von Philipp.

## Design „DTC Pop" (von Philipp gewählt, 14.08.2026)

Neo-Brutalismus: Cream `#fdf6e9` / Ink `#12100c`, Akzente Blau `#2b45ff`, Pink `#ff5d8f`, Gelb `#ffd23f`, Mint `#3ecf8e`. Fonts Archivo + Archivo Black (next/font). Tokens als `@theme` in `globals.css` (`bg-pop-yellow`, `shadow-pop`, `font-heavy`, `.pop-press`). Harte 3px-Borders, Offset-Schatten, leichte Rotationen. Print-CSS flacht Schatten/Rotationen ab — nicht entfernen. UI-Sprache: Deutsch, Du-Form, direkt, keine Emoji-Inflation.

## Offen vor Launch (Stand 14.08.2026)

Name/Domain · Demo-Report mit echten anonymisierten Daten · Impressum/Datenschutz/AGB · Deploy (Vercel Pro + Postgres + Stripe mit Tax + Anthropic-Key) · später Refresh-Report 19 € und Agentur-Packs.
