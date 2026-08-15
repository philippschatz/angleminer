import Link from "next/link";
import { redirect } from "next/navigation";
import { angemeldetAls } from "@/lib/session";
import { kontoGesehen, reportsFuerKonto } from "@/lib/store";
import { fill, konto as copy } from "@/content/copy";

export const dynamic = "force-dynamic";

// Der Kundenbereich. Entsteht mit dem Kauf, Anmeldung per Mail-Link.
// Texte: src/content/copy.ts unter "konto".

export default async function KontoSeite() {
  const email = await angemeldetAls();
  if (!email) redirect("/login");

  // Jeder Besuch verlängert die 24-Monats-Frist für die Aufbewahrung.
  await kontoGesehen(email);
  const reports = await reportsFuerKonto(email);

  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <nav className="mb-10 flex flex-wrap items-center justify-between gap-4">
        <Link href="/" className="font-heavy text-base">
          ANGLE<span className="ml-1 inline-block -rotate-2 border-2 border-ink bg-pop-yellow px-1.5 text-sm shadow-pop-sm">MINER</span>
        </Link>
        <form action="/api/logout" method="post">
          <button className="pop-press rounded-full border-2 border-ink bg-white px-4 py-2 text-sm font-bold shadow-pop-sm">
            {copy.abmelden}
          </button>
        </form>
      </nav>

      <h1 className="font-heavy mb-2 text-4xl uppercase">{copy.titel}</h1>
      <p className="mb-8 text-sm font-bold opacity-70">{fill(copy.begruessung, { email })}</p>

      {reports.length === 0 ? (
        <div className="rounded-3xl border-[3px] border-dashed border-ink bg-cream-2 px-8 py-10 text-center font-bold shadow-pop-sm">
          <p className="mb-6">{copy.leer}</p>
          <Link href="/new" className="pop-press inline-block rounded-2xl border-[3px] border-ink bg-pop-blue px-6 py-3 text-white shadow-pop">
            {copy.neuerReport}
          </Link>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {reports.map((r) => {
              const status = !r.paid
                ? copy.statusOffen
                : r.status === "ready"
                  ? copy.statusFertig
                  : copy.statusLaeuft;
              const statusBg = !r.paid
                ? "bg-cream-2"
                : r.status === "ready"
                  ? "bg-pop-mint"
                  : "bg-pop-yellow";
              return (
                <article key={r.id} className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border-[3px] border-ink bg-white px-6 py-5 shadow-pop-sm">
                  <div>
                    <h2 className="font-heavy text-lg">{r.data.brandName}</h2>
                    <p className="text-xs font-bold opacity-60">
                      {r.data.category} · {new Date(r.createdAt).toLocaleDateString("de-DE")} · {r.data.totalAnalyzed} Bewertungen
                    </p>
                    {r.zitateGeloeschtAm && (
                      <p className="mt-1 text-xs font-bold text-pop-blue">{copy.zitateGeloescht}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`font-heavy rounded-full border-2 border-ink px-3 py-1 text-[11px] uppercase ${statusBg}`}>
                      {status}
                    </span>
                    <Link href={`/r/${r.id}`} className="pop-press rounded-xl border-2 border-ink bg-pop-yellow px-4 py-2 text-sm font-bold shadow-pop-sm">
                      {copy.oeffnen}
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
          <div className="mt-10">
            <Link href="/new" className="pop-press inline-block rounded-2xl border-[3px] border-ink bg-pop-blue px-6 py-3 font-bold text-white shadow-pop">
              {copy.neuerReport}
            </Link>
          </div>
        </>
      )}
    </main>
  );
}
