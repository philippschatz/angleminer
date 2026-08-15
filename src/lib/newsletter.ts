import { einwilligungAnfragen } from "./store";
import { einwilligungBestaetigenMail, basisUrl } from "./mail";
import { neuerToken } from "./session";

// Double-Opt-in für Werbe-Mails.
//
// Für deutsche Empfänger führt daran kein Weg vorbei: Eine gesetzte Checkbox
// allein ist keine belastbare Einwilligung. Erst der Klick auf den Link in der
// Bestätigungsmail zählt — und genau dieser Zeitpunkt wird gespeichert, damit
// im Zweifel belegbar ist, wann jemand zugestimmt hat.
//
// Transaktionsmails (Anmeldelink, fertiger Report, Erstattung) haben damit
// NICHTS zu tun. Die laufen über die Vertragsbeziehung und brauchen keine
// Einwilligung — dürfen dann aber auch keine Werbung enthalten.

export async function einwilligungStarten(
  email: string,
  quelle: "kauf" | "vorschau",
  herkunft?: string
): Promise<void> {
  const sauber = email.trim().toLowerCase();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(sauber)) return;

  const token = await einwilligungAnfragen(sauber, neuerToken(), quelle);
  // null = schon bestätigt, dann keine zweite Mail.
  if (!token) return;

  const link = `${basisUrl(herkunft)}/api/newsletter/bestaetigen?token=${token}`;
  await einwilligungBestaetigenMail(sauber, link);
}
