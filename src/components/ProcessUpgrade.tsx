"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

// Nach der Zahlung: stößt das LLM-Upgrade an und lädt die Seite neu, wenn es fertig ist.
export default function ProcessUpgrade({ reportId }: { reportId: string }) {
  const router = useRouter();
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    let stopped = false;

    fetch("/api/process", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: reportId }),
    }).catch(() => {});

    const poll = setInterval(async () => {
      try {
        const res = await fetch(`/api/status?id=${reportId}`);
        const json = await res.json();
        if (json.status === "ready" && !stopped) {
          clearInterval(poll);
          router.refresh();
        }
      } catch { /* weiter pollen */ }
    }, 4000);

    return () => { stopped = true; clearInterval(poll); };
  }, [reportId, router]);

  return (
    <div className="mb-6 flex items-center gap-3 rounded-2xl border-[3px] border-ink bg-pop-mint px-5 py-4 text-sm font-bold shadow-pop-sm print:hidden">
      <span className="inline-block h-3 w-3 animate-pulse rounded-full border-2 border-ink bg-pop-yellow" />
      Zahlung erhalten! Die Tiefenanalyse läuft (jede Review wird einzeln getaggt) — die Seite aktualisiert sich automatisch, dauert 1–5 Minuten.
    </div>
  );
}
