"use client";

import { useState } from "react";
import Link from "next/link";
import { fehler, fill, report as reportCopy, upload } from "@/content/copy";
import {
  MAX_REVIEWS, VorschauErgebnis, VorschauFehler, vorschauBauen,
} from "@/lib/pipeline/browser";
import ReportView from "@/components/ReportView";

// Alle Texte dieser Seite stehen in src/content/copy.ts unter "upload".
//
// Wichtig: Analyse und Vorschau laufen komplett hier im Browser. Der Server
// sieht die Bewertungen erst, wenn der Kunde auf Freischalten klickt.

const inputCls = "w-full rounded-xl border-[3px] border-ink bg-white px-4 py-3 font-medium shadow-pop-sm focus:bg-[#fffbe8] focus:outline-none";

export default function NewReport() {
  const [brandName, setBrandName] = useState("");
  const [category, setCategory] = useState("");
  const [email, setEmail] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [pasted, setPasted] = useState("");
  const [mode, setMode] = useState<"file" | "paste">("file");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ergebnis, setErgebnis] = useState<VorschauErgebnis | null>(null);

  async function analysieren(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (mode === "file" && !file) { setError(upload.fehlerKeineDatei); return; }
    if (mode === "paste" && pasted.trim().length < 100) { setError(upload.fehlerZuWenigText); return; }

    setBusy(true);
    // Kurz Luft lassen, damit der Button-Zustand gezeichnet wird, bevor gerechnet wird.
    await new Promise((r) => setTimeout(r, 0));

    try {
      const csv = mode === "file" && file ? await file.text() : undefined;
      const res = vorschauBauen({
        csv,
        eingefuegt: pasted,
        brandName,
        category,
        texte: {
          keineBewertungen: fehler.keineBewertungen,
          zuWenigBewertungen: fehler.zuWenigBewertungen,
          zuVieleGefiltert: fehler.zuVieleGefiltert,
        },
      });
      setErgebnis(res);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setError(err instanceof VorschauFehler ? err.message : fehler.analyseFehlgeschlagen);
    } finally {
      setBusy(false);
    }
  }

  function zuruecksetzen() {
    setErgebnis(null);
    setFile(null);
    setPasted("");
    setError(null);
  }

  if (ergebnis) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-8">
        <nav className="mb-6 flex flex-wrap items-center justify-between gap-3 print:hidden">
          <Link href="/" className="font-heavy text-base">
            ANGLE<span className="ml-1 inline-block -rotate-2 border-2 border-ink bg-pop-yellow px-1.5 text-sm shadow-pop-sm">MINER</span>
          </Link>
          <button onClick={zuruecksetzen} className="pop-press rounded-full border-2 border-ink bg-white px-4 py-2 text-sm font-bold shadow-pop-sm">
            {upload.vorschauNeueDatei}
          </button>
        </nav>

        <div className="mb-6 rounded-2xl border-[3px] border-ink bg-pop-mint px-5 py-4 text-sm font-bold shadow-pop-sm print:hidden">
          {upload.vorschauHinweisLokal}
        </div>

        {ergebnis.abgeschnitten > 0 && (
          <div className="mb-6 rounded-2xl border-[3px] border-ink bg-pop-yellow px-5 py-4 text-sm font-bold shadow-pop-sm print:hidden">
            {fill(upload.vorschauAbgeschnitten, { max: MAX_REVIEWS, rest: ergebnis.abgeschnitten })}
          </div>
        )}

        <ReportView
          data={ergebnis.vorschau}
          unlocked={false}
          kaufBereich={<FreischaltenButton ergebnis={ergebnis} brandName={brandName} category={category} email={email} />}
        />
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-14">
      <Link href="/" className="mb-10 block text-sm font-bold hover:underline">{upload.zurueck}</Link>
      <span className="font-heavy mb-5 inline-block -rotate-1 rounded-full border-2 border-ink bg-pop-mint px-4 py-1.5 text-xs uppercase shadow-pop-sm">
        {upload.badge}
      </span>
      <h1 className="font-heavy mb-2 text-4xl uppercase">{upload.h1}</h1>
      <p className="mb-8 font-medium">{upload.subline}</p>

      <form onSubmit={analysieren} className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="font-heavy mb-2 block text-xs uppercase">{upload.labelMarke}</span>
            <input value={brandName} onChange={(e) => setBrandName(e.target.value)} required placeholder={upload.platzhalterMarke} className={inputCls} />
          </label>
          <label className="block">
            <span className="font-heavy mb-2 block text-xs uppercase">{upload.labelKategorie}</span>
            <input value={category} onChange={(e) => setCategory(e.target.value)} required placeholder={upload.platzhalterKategorie} className={inputCls} />
          </label>
        </div>

        <label className="block">
          <span className="font-heavy mb-2 block text-xs uppercase">
            {upload.labelEmail} <span className="opacity-50">{upload.labelEmailZusatz}</span>
          </span>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={upload.platzhalterEmail} className={inputCls} />
        </label>

        <div>
          <div className="mb-3 flex gap-2 text-sm font-bold">
            <button type="button" onClick={() => setMode("file")}
              className={`rounded-full border-2 border-ink px-4 py-1.5 ${mode === "file" ? "bg-ink text-cream" : "bg-white"}`}>
              {upload.tabDatei}
            </button>
            <button type="button" onClick={() => setMode("paste")}
              className={`rounded-full border-2 border-ink px-4 py-1.5 ${mode === "paste" ? "bg-ink text-cream" : "bg-white"}`}>
              {upload.tabText}
            </button>
          </div>

          {mode === "file" ? (
            <label className="pop-press block cursor-pointer rounded-3xl border-[3px] border-dashed border-ink bg-pop-yellow p-10 text-center shadow-pop">
              <input type="file" accept=".csv,.txt" className="hidden" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
              {file ? (
                <span className="font-heavy">{file.name} <span className="font-sans text-sm font-bold opacity-60">({Math.round(file.size / 1024)} KB)</span></span>
              ) : (
                <>
                  <span className="font-heavy mb-1 block text-lg uppercase">📦 {upload.dropzoneTitel}</span>
                  <span className="text-sm font-bold">{upload.dropzoneUnterzeile}</span>
                </>
              )}
            </label>
          ) : (
            <textarea value={pasted} onChange={(e) => setPasted(e.target.value)} rows={8}
              placeholder={upload.textPlatzhalter}
              className="w-full rounded-3xl border-[3px] border-ink bg-white px-4 py-3 font-medium shadow-pop-sm focus:outline-none" />
          )}
        </div>

        {error && <p className="rounded-xl border-[3px] border-ink bg-pop-pink px-4 py-3 text-sm font-bold">{error}</p>}

        <button disabled={busy} className="pop-press w-full rounded-2xl border-[3px] border-ink bg-pop-blue px-6 py-4 font-bold text-white shadow-pop disabled:opacity-50">
          {busy ? upload.buttonLaeuft : upload.buttonBereit}
        </button>
        <p className="text-center text-xs font-medium opacity-70">{upload.datenschutzHinweis}</p>
      </form>
    </main>
  );
}

/**
 * Erst dieser Klick lädt Daten hoch: bereinigte Bewertungen zum Server, Report
 * anlegen, weiter zu Stripe. Bewusst VOR der Weiterleitung — wer unterwegs das
 * Gerät wechselt oder abbricht, verliert seine Analyse dadurch nicht.
 */
function FreischaltenButton({
  ergebnis, brandName, category, email,
}: {
  ergebnis: VorschauErgebnis;
  brandName: string;
  category: string;
  email: string;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function freischalten() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brandName,
          category,
          email: email || undefined,
          cleanStats: ergebnis.cleanStats,
          reviews: ergebnis.upload,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.url) { setError(json.error ?? reportCopy.kaufFehler); setBusy(false); return; }
      window.location.href = json.url;
    } catch {
      setError(reportCopy.kaufFehlerNetzwerk);
      setBusy(false);
    }
  }

  return (
    <div>
      <button onClick={freischalten} disabled={busy}
        className="pop-press rounded-2xl border-[3px] border-ink bg-pop-yellow px-8 py-4 font-bold shadow-pop disabled:opacity-50">
        {busy ? upload.vorschauUploadLaeuft : `🔓 ${reportCopy.kaufButton}`}
      </button>
      {error && <p className="mt-2 text-sm font-bold">{error}</p>}
    </div>
  );
}
