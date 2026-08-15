# Stripe einrichten — Schritt für Schritt

Alles, was du bei Stripe klicken musst, mit den genauen Werten. Reihenfolge einhalten:
Die Verifizierung dauert 1–2 Werktage, alles andere sind Minuten.

## 1. Konto anlegen

`dashboard.stripe.com/register` — mit Geschäfts-Mailadresse, nicht privat.

**Halte bereit:**
- Rechtsform und Firmenname (bei dir vermutlich die Philipp Schatz UG)
- Handelsregisternummer und Umsatzsteuer-ID
- Geschäftsadresse
- Personalausweis oder Reisepass der geschäftsführenden Person
- IBAN des Geschäftskontos
- Kurzbeschreibung, was verkauft wird — für uns:
  *„Digitale Analyse-Reports aus Kundenbewertungen. Einmalzahlung, kein Abo, sofortige digitale Lieferung."*

**Wichtig für die Prüfung:** Stripe schaut sich die Website an. Wenn die Domain noch leer ist,
kann die Freigabe hängen. Deshalb erst Domain kaufen, Seite live schalten, dann verifizieren.

## 2. Steuer aktivieren

Dashboard → **Steuern** → Stripe Tax aktivieren.

- Registrierung für **Deutschland** eintragen (deine USt-ID)
- Voreinstellung Produktkategorie: **digitale Dienstleistung**
- Preisangabe: **inklusive Steuer** — bei Verkauf an Endkunden in DE muss der
  Bruttopreis stehen. 49 € sind der Endpreis.

Danach in Vercel setzen: `STRIPE_AUTOMATIC_TAX=1`

> Kein Produkt und keinen Preis anlegen! Die Anwendung erzeugt beides bei jedem
> Kauf selbst. Ein Produkt im Dashboard wäre wirkungslos.

## 3. Webhook einrichten

Erst **nachdem** die Seite unter deiner Domain erreichbar ist.

Dashboard → **Entwickler** → **Webhooks** → **Endpunkt hinzufügen**

| Feld | Wert |
|---|---|
| Endpunkt-URL | `https://DEINE-DOMAIN/api/stripe-webhook` |
| Zu sendende Ereignisse | **nur** `checkout.session.completed` |

Nach dem Anlegen zeigt Stripe ein **Signing Secret** (beginnt mit `whsec_`).
Das kommt in Vercel als `STRIPE_WEBHOOK_SECRET`.

## 4. Schlüssel abholen

Dashboard → **Entwickler** → **API-Schlüssel**

| Stripe | Vercel-Variable |
|---|---|
| Geheimer Schlüssel (`sk_test_…` bzw. `sk_live_…`) | `STRIPE_SECRET_KEY` |
| Webhook Signing Secret (`whsec_…`) | `STRIPE_WEBHOOK_SECRET` |

Erst im **Testmodus** arbeiten. Der Umschalter sitzt oben rechts im Dashboard.
Test- und Live-Modus haben **getrennte** Schlüssel und **getrennte** Webhooks —
beim Umschalten also beides neu eintragen.

## 5. Erstattungen zulassen

Nichts einzustellen, aber gut zu wissen: Die Anwendung erstattet **selbstständig**,
wenn die KI-Analyse zu einem großen Teil ausgefallen ist. Das läuft über die
normale Stripe-Schnittstelle und braucht keine Freigabe. In deinem Dashboard
tauchen solche Erstattungen mit dem Vermerk auf, dass sie automatisch erfolgten.

Rechne damit, dass Stripe die Gebühr für die ursprüngliche Zahlung **einbehält**.
Eine automatische Erstattung kostet dich also die ~1 €, nicht nur den Umsatz.

## 6. Testkauf

Testmodus, Testkarte:

```
Kartennummer   4242 4242 4242 4242
Ablaufdatum    beliebig in der Zukunft
Prüfziffer     beliebig
```

Prüfen nach dem Kauf:
- [ ] Report schaltet frei
- [ ] Fortschrittsanzeige läuft
- [ ] Mail „Dein Report ist fertig" kommt an, nicht im Spam
- [ ] Report liegt unter `/konto`, nachdem du dich per Mail-Link angemeldet hast
- [ ] Im Stripe-Dashboard steht die Zahlung mit korrekt ausgewiesener Umsatzsteuer

## 7. Scharf schalten

- [ ] Im Dashboard auf **Live-Modus** umschalten
- [ ] Live-Schlüssel in Vercel eintragen (`sk_live_…`)
- [ ] Webhook im Live-Modus **neu** anlegen, neues Signing Secret eintragen
- [ ] Einen echten Kauf mit eigener Karte machen — und danach selbst erstatten

## Was dich das kostet

| Posten | Höhe |
|---|---|
| Europäische Karte | 1,5 % + 0,25 € |
| Nicht-europäische Karte | 3,25 % + 0,25 € |
| Stripe Tax | 0,5 % pro Transaktion |

Bei 49 € sind das rund **1,25 €** pro Verkauf.
