import { buildReport } from "./pipeline/aggregate";
import { enhanceReport } from "./pipeline/enhance";
import { complianceFlagsFor, heuristicTag } from "./pipeline/tagger";
import { llmVerfuegbar, tagReviews } from "./pipeline/tagger-llm";
import { Fortschritt, StoredReport, TaggedReview } from "./pipeline/types";
import { saveReport } from "./store";
import { basisUrl, erstattungsMail, reportFertigMail } from "./mail";

// Die Tiefenanalyse nach der Zahlung.
//
// Sie läuft NICHT im Browser-Tab des Käufers, sondern serverseitig: angestoßen
// vom Stripe-Webhook, nachgeholt von einem Zeitplan. Bei 5.000 Bewertungen
// passt sie nicht in eine einzige Serverfunktion, deshalb arbeitet sie in
// Portionen und schreibt ihren Fortschritt nach jeder Runde weg. Reißt die
// Funktion ihr Zeitlimit, macht der nächste Durchgang genau dort weiter.

/** Unter diesem Anteil KI-getaggter Bewertungen gilt der Report als nicht geliefert. */
export const ERSTATTUNGS_SCHWELLE = 0.9;

/**
 * Zeitpuffer bis zum Funktions-Timeout, damit Speichern noch sicher klappt.
 * Klein gehalten, weil auf dem Hobby-Tarif nur 60 s zur Verfügung stehen —
 * bei einem grossen Puffer bliebe kaum Zeit für eine einzige Runde.
 */
const PUFFER_MS = 10_000;

export type SchrittErgebnis = {
  status: StoredReport["status"];
  erledigt: number;
  gesamt: number;
  fertig: boolean;
};

function leererFortschritt(gesamt: number): Fortschritt {
  return { erledigt: 0, gesamt, tags: {}, vonKi: 0, zuletzt: new Date().toISOString() };
}

/**
 * Arbeitet eine Portion ab. Gibt zurück, wie weit der Report ist.
 * Mehrfach aufrufbar; nimmt beim vorhandenen Fortschritt den Faden auf.
 */
export async function verarbeitungsSchritt(
  report: StoredReport,
  budgetMs: number
): Promise<SchrittErgebnis> {
  const roh = report.rawReviews ?? [];

  // Ohne Rohdaten oder ohne KI-Schlüssel ist der Regelwerk-Report das Endergebnis.
  if (roh.length === 0 || !llmVerfuegbar()) {
    await finalisieren(report, null, 0);
    return { status: "ready", erledigt: 0, gesamt: 0, fertig: true };
  }

  const fortschritt = report.fortschritt ?? leererFortschritt(roh.length);
  const offen = roh.filter((r) => !(r.id in fortschritt.tags));

  if (offen.length > 0) {
    if (report.status !== "processing") {
      report.status = "processing";
      report.fortschritt = fortschritt;
      await saveReport(report);
    }

    const start = Date.now();
    const { tags, vonKi } = await tagReviews(offen, () => Date.now() - start > budgetMs - PUFFER_MS);

    for (const [id, t] of tags) fortschritt.tags[id] = t;
    fortschritt.vonKi += vonKi;
    fortschritt.erledigt = Object.keys(fortschritt.tags).length;
    fortschritt.zuletzt = new Date().toISOString();

    report.fortschritt = fortschritt;
    await saveReport(report);
  }

  const nochOffen = roh.some((r) => !(r.id in fortschritt.tags));
  if (nochOffen) {
    return { status: "processing", erledigt: fortschritt.erledigt, gesamt: fortschritt.gesamt, fertig: false };
  }

  await finalisieren(report, fortschritt, fortschritt.vonKi);
  return { status: "ready", erledigt: fortschritt.gesamt, gesamt: fortschritt.gesamt, fertig: true };
}

/**
 * Baut den endgültigen Report, löscht die Rohdaten, verschickt die Mail — und
 * erstattet automatisch, wenn die KI zu wenig gesehen hat.
 */
async function finalisieren(
  report: StoredReport,
  fortschritt: Fortschritt | null,
  vonKi: number
): Promise<void> {
  const roh = report.rawReviews ?? [];

  if (fortschritt && roh.length > 0) {
    const tagged: TaggedReview[] = roh.map((r) => ({
      ...r,
      tags: fortschritt.tags[r.id],
      complianceFlags: complianceFlagsFor(`${r.title ?? ""} ${r.body}`),
      taggedBy: "llm" as const,
    }));
    let data = buildReport({
      id: report.id,
      tagged,
      cleanStats: report.data.cleanStats,
      brandName: report.data.brandName,
      category: report.data.category,
      email: report.email,
      llmEnhanced: false,
    });
    data = await enhanceReport(data);
    report.data = data;
    report.kiAnteil = roh.length > 0 ? vonKi / roh.length : 0;
  } else if (roh.length > 0) {
    // Kein KI-Lauf möglich: Regelwerk bleibt gültig, aber ehrlich ausgewiesen.
    report.data = buildReport({
      id: report.id,
      tagged: heuristicTag(roh),
      cleanStats: report.data.cleanStats,
      brandName: report.data.brandName,
      category: report.data.category,
      email: report.email,
      llmEnhanced: false,
    });
    report.kiAnteil = 0;
  }

  report.status = "ready";
  report.rawReviews = undefined; // Datensparsamkeit: Rohdaten nach der Verarbeitung weg
  report.fortschritt = undefined;
  await saveReport(report);

  const empfaenger = report.ownerEmail ?? report.email;
  const link = `${basisUrl()}/r/${report.id}`;

  const zuWenigKi = (report.kiAnteil ?? 0) < ERSTATTUNGS_SCHWELLE;
  if (zuWenigKi && report.paid && !report.refunded) {
    const erstattet = await erstatten(report);
    if (erstattet && empfaenger) {
      await erstattungsMail(empfaenger, report.data.brandName, link);
      return; // Erstattungsmail ersetzt die Fertig-Mail
    }
  }

  if (empfaenger) await reportFertigMail(empfaenger, report.data.brandName, link);
}

/**
 * Erstattet die Zahlung. Der Kunde behält den Report — er hat ja einen, nur
 * nicht den, für den er bezahlt hat.
 */
async function erstatten(report: StoredReport): Promise<boolean> {
  if (!process.env.STRIPE_SECRET_KEY || !report.stripeSessionId) return false;
  try {
    const { default: Stripe } = await import("stripe");
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const session = await stripe.checkout.sessions.retrieve(report.stripeSessionId);
    const zahlung = typeof session.payment_intent === "string"
      ? session.payment_intent
      : session.payment_intent?.id;
    if (!zahlung) return false;

    await stripe.refunds.create({ payment_intent: zahlung });
    report.refunded = true;
    await saveReport(report);
    console.warn(
      `Report ${report.id} automatisch erstattet — nur ${Math.round((report.kiAnteil ?? 0) * 100)} % per KI getaggt.`
    );
    return true;
  } catch (e) {
    console.error("Erstattung fehlgeschlagen", report.id, e);
    return false;
  }
}
