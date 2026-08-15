import { fill, mails } from "@/content/copy";

// Transaktionsmails (Anmeldelink, fertiger Report, Erstattung, Ablaufwarnung).
//
// Bewusst ohne SDK: ein einziger fetch gegen die Resend-Schnittstelle. Ein
// anderer Anbieter ist ein Austausch von versendenUeberAnbieter().
// Ohne Schluessel wird die Mail ins Serverprotokoll geschrieben — so laesst
// sich der komplette Ablauf lokal durchspielen, ohne dass etwas rausgeht.
//
// beehiiv ist hierfuer NICHT geeignet: das ist eine Newsletter-Plattform,
// kein Transaktionsversand. beehiiv bleibt fuer Marketing-Mails an Leute,
// die eingewilligt haben.

export type MailErgebnis = { versendet: boolean; grund?: string };

function absender(): string {
  return process.env.MAIL_FROM || "Angle Miner <onboarding@resend.dev>";
}

async function versendenUeberAnbieter(an: string, betreff: string, text: string): Promise<MailErgebnis> {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.log(
      `\n───── MAIL (Dev-Modus, nicht versendet) ─────\nAn:      ${an}\nBetreff: ${betreff}\n\n${text}\n────────────────────────────────────────────\n`
    );
    return { versendet: false, grund: "kein RESEND_API_KEY — nur protokolliert" };
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: absender(), to: [an], subject: betreff, text }),
    });
    if (!res.ok) {
      const body = await res.text();
      console.error("Mailversand fehlgeschlagen", res.status, body.slice(0, 300));
      return { versendet: false, grund: `Anbieter antwortete ${res.status}` };
    }
    return { versendet: true };
  } catch (e) {
    console.error("Mailversand fehlgeschlagen", e);
    return { versendet: false, grund: "Netzwerkfehler" };
  }
}

export function basisUrl(fallback?: string): string {
  return process.env.NEXT_PUBLIC_BASE_URL || fallback || "http://localhost:3000";
}

export function anmeldeMail(an: string, link: string): Promise<MailErgebnis> {
  return versendenUeberAnbieter(an, mails.anmeldenBetreff, fill(mails.anmeldenText, { link }));
}

export function reportFertigMail(an: string, marke: string, link: string): Promise<MailErgebnis> {
  return versendenUeberAnbieter(
    an,
    fill(mails.fertigBetreff, { marke }),
    fill(mails.fertigText, { marke, link })
  );
}

export function erstattungsMail(an: string, marke: string, link: string): Promise<MailErgebnis> {
  return versendenUeberAnbieter(
    an,
    fill(mails.erstattungBetreff, { marke }),
    fill(mails.erstattungText, { marke, link })
  );
}

/** Double-Opt-in: ohne Klick auf diesen Link darf nicht geworben werden. */
export function einwilligungBestaetigenMail(an: string, link: string): Promise<MailErgebnis> {
  return versendenUeberAnbieter(an, mails.bestaetigenBetreff, fill(mails.bestaetigenText, { link }));
}

export function ablaufWarnungMail(an: string, tage: number, link: string): Promise<MailErgebnis> {
  return versendenUeberAnbieter(
    an,
    mails.ablaufBetreff,
    fill(mails.ablaufText, { tage, link })
  );
}
