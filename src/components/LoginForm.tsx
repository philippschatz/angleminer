"use client";

import { useState } from "react";
import { konto as copy } from "@/content/copy";

// Texte: src/content/copy.ts unter "konto"

export default function LoginForm({ linkUngueltig }: { linkUngueltig?: boolean }) {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [gesendet, setGesendet] = useState(false);
  const [fehler, setFehler] = useState<string | null>(linkUngueltig ? copy.loginLinkUngueltig : null);

  async function abschicken(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setFehler(null);
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) { setFehler(copy.loginFehler); setBusy(false); return; }
      setGesendet(true);
    } catch {
      setFehler(copy.loginFehler);
    } finally {
      setBusy(false);
    }
  }

  if (gesendet) {
    return (
      <div className="rounded-3xl border-[3px] border-ink bg-pop-mint px-6 py-6 font-bold shadow-pop">
        {copy.loginGesendet}
      </div>
    );
  }

  return (
    <form onSubmit={abschicken} className="space-y-5">
      <label className="block">
        <span className="font-heavy mb-2 block text-xs uppercase">{copy.loginLabel}</span>
        <input
          type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
          placeholder={copy.loginPlatzhalter}
          className="w-full rounded-xl border-[3px] border-ink bg-white px-4 py-3 font-medium shadow-pop-sm focus:bg-[#fffbe8] focus:outline-none"
        />
      </label>

      {fehler && <p className="rounded-xl border-[3px] border-ink bg-pop-pink px-4 py-3 text-sm font-bold">{fehler}</p>}

      <button disabled={busy}
        className="pop-press w-full rounded-2xl border-[3px] border-ink bg-pop-blue px-6 py-4 font-bold text-white shadow-pop disabled:opacity-50">
        {busy ? copy.loginButtonLaeuft : copy.loginButton}
      </button>
    </form>
  );
}
