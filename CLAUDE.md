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

- `src/lib/pipeline/` — das Herz: `parse.ts` (CSV-Spalten-Heuristik) → `clean.ts` (Dedupe/Junk/PII/Seeding) → `tagger.ts` (Heuristik + Claude-Batches) → `aggregate.ts` (deterministische Zählung) → `enhance.ts` (ein LLM-Call für Titel/Hooks)
- `src/lib/store.ts` — Storage-Adapter: Postgres via DATABASE_URL, sonst Dateisystem `.data/`
- API-Flow: `/api/analyze` (Upload→Preview) · `/api/checkout` + `/api/stripe-webhook` (Zahlung) · `/api/process` (LLM-Upgrade nach Zahlung, maxDuration 300) · `/api/status` (Polling)
- Report-Gating in `src/app/r/[id]/page.tsx`: unbezahlt = Vorschau (Angle 1 + Locked Sections), bezahlt = voll

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
