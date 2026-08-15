"use client";

import { useState } from "react";
import { einwilligung as copy } from "@/content/copy";

// Eigenständige Eintragung in der Vorschau — für Leute, die noch nicht kaufen.
// Ohne diese Box erreicht dich deren Adresse nie, weil vor dem Kauf nichts
// zum Server geht.
//
// Der Klick auf "Eintragen" IST die Einwilligung (aktive Handlung), die
// Bestätigungsmail macht daraus ein Double-Opt-in.

export default function NewsletterBox() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [fertig, setFertig] = useState(false);
  const [fehler, setFehler] = useState<string | null>(null);

  async function eintragen(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setFehler(null);
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) { setFehler(copy.vorschauFehler); setBusy(false); return; }
      setFertig(true);
    } catch {
      setFehler(copy.vorschauFehler);
      setBusy(false);
    }
  }

  if (fertig) {
    return (
      <div className="mt-8 rounded-3xl border-[3px] border-ink bg-pop-mint px-6 py-6 font-bold shadow-pop-sm print:hidden">
        {copy.vorschauDanke}
      </div>
    );
  }

  return (
    <div className="mt-8 rounded-3xl border-[3px] border-ink bg-white px-6 py-6 shadow-pop-sm print:hidden">
      <h3 className="font-heavy mb-1 text-lg uppercase">{copy.vorschauTitel}</h3>
      <p className="mb-4 text-sm font-medium">{copy.vorschauText}</p>
      <form onSubmit={eintragen} className="flex flex-wrap gap-3">
        <input
          type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
          placeholder={copy.vorschauPlatzhalter}
          className="min-w-[14rem] flex-1 rounded-xl border-[3px] border-ink bg-cream px-4 py-2.5 font-medium focus:bg-[#fffbe8] focus:outline-none"
        />
        <button disabled={busy}
          className="pop-press rounded-xl border-[3px] border-ink bg-pop-blue px-5 py-2.5 font-bold text-white shadow-pop-sm disabled:opacity-50">
          {busy ? copy.vorschauButtonLaeuft : copy.vorschauButton}
        </button>
      </form>
      {fehler && <p className="mt-2 text-sm font-bold">{fehler}</p>}
      <p className="mt-3 text-xs font-medium opacity-70">{copy.checkboxHinweis}</p>
    </div>
  );
}
