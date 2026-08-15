"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { fill, report as t } from "@/content/copy";

// Zeigt den Fortschritt der Tiefenanalyse, solange der Käufer auf der Seite ist.
//
// Der erste Aufruf startet die Verarbeitung sofort, damit niemand auf den
// nächsten Zeitplan-Lauf warten muss. Danach wird nur noch gepollt. Schließt
// der Käufer den Tab, läuft alles serverseitig weiter — diese Komponente ist
// Anzeige, keine Voraussetzung.

export default function ProcessUpgrade({ reportId }: { reportId: string }) {
  const router = useRouter();
  const started = useRef(false);
  const [erledigt, setErledigt] = useState(0);
  const [gesamt, setGesamt] = useState(0);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    let gestoppt = false;

    fetch("/api/process", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: reportId }),
    }).catch(() => {});

    const poll = setInterval(async () => {
      try {
        const res = await fetch(`/api/status?id=${reportId}`);
        const json = await res.json();
        if (gestoppt) return;
        if (typeof json.erledigt === "number") setErledigt(json.erledigt);
        if (typeof json.gesamt === "number") setGesamt(json.gesamt);
        if (json.status === "ready") {
          clearInterval(poll);
          router.refresh();
        }
      } catch { /* weiter pollen */ }
    }, 4000);

    return () => { gestoppt = true; clearInterval(poll); };
  }, [reportId, router]);

  const prozent = gesamt > 0 ? Math.round((erledigt / gesamt) * 100) : 0;

  return (
    <div className="mb-6 rounded-2xl border-[3px] border-ink bg-pop-mint px-5 py-4 text-sm font-bold shadow-pop-sm print:hidden">
      <div className="flex items-center gap-3">
        <span className="inline-block h-3 w-3 shrink-0 animate-pulse rounded-full border-2 border-ink bg-pop-yellow" />
        <span>{t.verarbeitungLaeuft}</span>
      </div>
      {gesamt > 0 && (
        <>
          <div className="mt-3 h-3 w-full overflow-hidden rounded-full border-2 border-ink bg-white">
            <div className="h-full bg-pop-blue transition-all duration-500" style={{ width: `${prozent}%` }} />
          </div>
          <p className="mt-1.5 text-xs">{fill(t.verarbeitungFortschritt, { erledigt, gesamt })}</p>
        </>
      )}
    </div>
  );
}
