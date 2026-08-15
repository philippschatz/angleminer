"use client";

import { useState } from "react";
import { report as t } from "@/content/copy";

// Texte: src/content/copy.ts unter "report"
export default function BuyButton({ reportId }: { reportId: string }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function buy() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportId }),
      });
      const json = await res.json();
      if (!res.ok || !json.url) { setError(json.error ?? t.kaufFehler); setBusy(false); return; }
      window.location.href = json.url;
    } catch {
      setError(t.kaufFehlerNetzwerk);
      setBusy(false);
    }
  }

  return (
    <div>
      <button onClick={buy} disabled={busy}
        className="pop-press rounded-2xl border-[3px] border-ink bg-pop-yellow px-8 py-4 font-bold shadow-pop disabled:opacity-50">
        {busy ? t.kaufButtonLaeuft : `🔓 ${t.kaufButton}`}
      </button>
      {error && <p className="mt-2 text-sm font-bold">{error}</p>}
    </div>
  );
}
