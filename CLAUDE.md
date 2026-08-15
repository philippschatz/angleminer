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
2. Klick auf „Freischalten" — **jetzt erst** gehen die bereinigten Bewertungen an `/api/report`. Bewusst vor der Weiterleitung zu Stripe, damit Gerätewechsel oder Abbruch die Analyse nicht vernichten.
3. Stripe → `/api/stripe-webhook` schaltet frei, legt das Konto an (Adresse aus dem Formular, sonst die von Stripe) und antwortet sofort — er rechnet bewusst nicht selbst.
4. `/api/cron/verarbeiten` (jede Minute) arbeitet die Tiefenanalyse in Portionen ab und sichert den Fortschritt nach jeder Runde. Ein Funktions-Timeout kostet nur die angefangene Portion. `/api/process` ist derselbe Schritt als Sofortstart, solange der Käufer noch auf der Seite ist — **Anzeige, keine Voraussetzung**.
5. Fertig → Mail mit Link. Unter `ERSTATTUNGS_SCHWELLE` (90 % per KI getaggt) wird **automatisch über Stripe erstattet**, der Kunde behält den Report und bekommt die Erstattungsmail statt der Fertig-Mail.
6. `/konto` — Anmeldung per Einmal-Link, kein Passwort. Report-URLs bleiben zusätzlich direkt aufrufbar (nanoid(12), nicht erratbar), damit der Mail-Link ohne Umweg funktioniert.
7. `/api/cron/aufraeumen` (täglich 4 Uhr): abgebrochene Käufe nach 24 h löschen · nach 24 Monaten ohne Anmeldung Zitate und Texte entfernen, **Vergleichszahlen bleiben** (Grundlage für den Refresh-Report).

## Weitere unverhandelbare Regeln (seit 15.08.2026)

7. **Der Server sieht keine Namen.** Hochgeladen werden nur `id`, `text`, `rating`, `date` — Vornamen fliegen schon in der Browser-Vorschau raus, damit der bezahlte Report exakt so aussieht wie das Gezeigte.
8. **Der Kauf-Tab ist nie Voraussetzung.** Alles, was nach der Zahlung passiert, muss auch dann durchlaufen, wenn der Käufer den Tab sofort schließt.
9. **Modellaufrufe nur über `callModel()`** in `tagger-llm.ts` — damit ein Wechsel nach Bedrock EU eine Funktion betrifft und nicht die halbe Pipeline.
10. **Das Anthropic-SDK darf nicht ins Browser-Bundle.** Deshalb die Trennung `tagger.ts` / `tagger-llm.ts`. Bei Änderungen prüfen: `grep -rl anthropic .next/static/chunks/` muss leer bleiben.

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
