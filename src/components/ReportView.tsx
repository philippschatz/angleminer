import { Quote, ReportData, THEME_LABELS } from "@/lib/pipeline/types";
import BuyButton from "./BuyButton";

const FLAG_LABELS: Record<string, string> = {
  klimaneutral: "Klima-Claim",
  plastikfrei: "Plastik-Claim",
  made_in_germany: "Herkunfts-Claim",
  siegel: "Siegel-Claim",
  absolut_claim: "Absolut-Claim",
  heilversprechen: "Gesundheits-Claim",
};

function QuoteCard({ q, white }: { q: Quote; white?: boolean }) {
  return (
    <blockquote className={`rounded-2xl border-[2.5px] border-ink ${white ? "bg-white" : "bg-cream"} p-4 text-sm font-medium`}>
      <p>„{q.text}"</p>
      <footer className="mt-2 flex flex-wrap items-center gap-2 text-xs font-bold opacity-60">
        {q.author && <span>{q.author}</span>}
        {q.rating !== undefined && <span>· {q.rating}★</span>}
        {q.date && <span>· {q.date}</span>}
      </footer>
      {q.complianceFlags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {q.complianceFlags.map((f) => (
            <span key={f} className="rounded-lg border-2 border-ink bg-pop-yellow px-2 py-0.5 text-[11px] font-bold">
              ⚠ {FLAG_LABELS[f] ?? f} — nicht 1:1 in Ads
            </span>
          ))}
        </div>
      )}
    </blockquote>
  );
}

function TrendBadge({ trend }: { trend: string }) {
  if (trend === "steigend") return <span className="rounded-full border-2 border-ink bg-pop-mint px-2.5 py-0.5 text-[11px] font-bold uppercase">↑ steigend</span>;
  if (trend === "fallend") return <span className="rounded-full border-2 border-ink bg-pop-pink px-2.5 py-0.5 text-[11px] font-bold uppercase">↓ fallend</span>;
  if (trend === "stabil") return <span className="rounded-full border-2 border-ink bg-cream px-2.5 py-0.5 text-[11px] font-bold uppercase">→ stabil</span>;
  return null;
}

function SectionTitle({ title, chip, chipBg }: { title: string; chip?: string; chipBg?: string }) {
  return (
    <h2 className="font-heavy mb-1 mt-14 flex flex-wrap items-center gap-3 text-2xl uppercase">
      {title}
      {chip && <span className={`font-heavy -rotate-2 rounded-full border-[2.5px] border-ink px-3 py-1 text-xs shadow-pop-sm ${chipBg ?? "bg-pop-blue text-white"}`}>{chip}</span>}
    </h2>
  );
}

function LockedCard({ title, note }: { title: string; note: string }) {
  return (
    <div className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-3xl border-[3px] border-dashed border-ink bg-cream-2 px-6 py-5 font-bold">
      <b className="font-heavy uppercase">{title}</b>
      <span className="text-sm">{note} 🔒</span>
    </div>
  );
}

const KPI_BGS = ["bg-pop-yellow -rotate-1", "bg-white rotate-1", "bg-pop-mint -rotate-1", "bg-pop-pink rotate-1"];

export default function ReportView({ data, unlocked }: { data: ReportData; unlocked: boolean }) {
  const previewAngles = unlocked ? data.angles : data.angles.slice(0, 1);
  const s = data.cleanStats;
  const kpis = [
    { v: String(data.totalAnalyzed), l: "Reviews" },
    { v: data.ratingAvg ? `${data.ratingAvg.toFixed(1).replace(".", ",")}★` : "—", l: "Ø Rating" },
    { v: `${Math.round(((data.sentimentSplit.positiv || 0) / Math.max(1, data.totalAnalyzed)) * 100)} %`, l: "positiv" },
    { v: String(data.objections.reduce((a, o) => a + o.mentions, 0)), l: "Objections" },
  ];

  return (
    <div>
      <header className="pt-2">
        <span className={`font-heavy inline-block -rotate-1 rounded-full border-2 border-ink px-4 py-1.5 text-xs uppercase shadow-pop-sm ${unlocked ? "bg-pop-mint" : "bg-pop-yellow"}`}>
          VoC-Report · {unlocked ? "Vollversion ✔" : "Vorschau"}
        </span>
        <h1 className="font-heavy mt-4 text-4xl uppercase tracking-tight">{data.brandName}</h1>
        <p className="mt-1 text-sm font-bold">{data.category} · erstellt am {new Date(data.createdAt).toLocaleDateString("de-DE")}</p>
      </header>

      <section className="my-7 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {kpis.map((kpi, i) => (
          <div key={kpi.l} className={`rounded-2xl border-[3px] border-ink p-4 shadow-pop-sm ${KPI_BGS[i]}`}>
            <div className="font-heavy text-3xl">{kpi.v}</div>
            <div className="text-xs font-bold uppercase">{kpi.l}</div>
          </div>
        ))}
      </section>

      <section className="mb-10 rounded-2xl border-[3px] border-ink bg-white px-5 py-4 text-sm font-medium shadow-pop-sm">
        <b>Datenbasis, ehrlich:</b> {s.input} eingelesen · {s.junk} Junk raus · {s.duplicates} Duplikate raus · {s.piiScrubbed}× persönliche Daten bereinigt.
        {s.seedingAlert && (
          <span className="mt-2 block rounded-xl border-2 border-ink bg-pop-yellow px-3 py-2 text-[13px] font-bold">
            ⚠ Seeding-Alarm: {s.seedingAlert.map((x) => `„${x.body}…" (${x.count}×)`).join(" · ")} — ignoriert.
          </span>
        )}
        {!data.llmEnhanced && unlocked && (
          <span className="mt-2 block text-xs opacity-60">Hinweis: Dieser Report basiert auf der regelbasierten Analyse.</span>
        )}
      </section>

      <SectionTitle title="Angle-Map" chip={unlocked ? `${data.angles.length} Angles` : `1 von ${data.angles.length} gratis`} />
      <p className="mb-6 text-sm font-medium">Sortiert nach Häufigkeit × Emotion × Ad-Eignung. Jede Zahl nachzählbar, jedes Zitat wörtlich.</p>

      <div className="space-y-6">
        {previewAngles.map((a, i) => (
          <article key={a.theme} className="rounded-3xl border-[3px] border-ink bg-white p-6 shadow-pop">
            <div className="mb-1 flex flex-wrap items-center gap-3">
              <span className="font-heavy rounded-xl bg-ink px-3 py-1 text-sm text-pop-yellow">#{i + 1}</span>
              <h3 className="font-heavy text-xl">{a.title}</h3>
              <TrendBadge trend={a.trend} />
            </div>
            <p className="mb-4 text-sm font-bold">
              {a.title !== THEME_LABELS[a.theme] && <>{THEME_LABELS[a.theme]} · </>}
              <span className="rounded-md bg-pop-yellow px-1.5">{a.mentions} Nennungen</span> ({a.sharePct} %) · {a.positivePct} % positiv
            </p>
            <div className="mb-4 grid gap-3 sm:grid-cols-2">
              {a.quotes.map((q, j) => <QuoteCard key={j} q={q} />)}
            </div>
            {a.hooks.length > 0 && (
              <div className="rounded-2xl bg-ink p-5 text-cream">
                <p className="font-heavy mb-2 text-[11px] uppercase tracking-wide text-pop-yellow">Hook-Startpunkte</p>
                <ul className="space-y-1 text-sm font-medium">
                  {a.hooks.map((h, j) => <li key={j}>⚡ {h}</li>)}
                </ul>
              </div>
            )}
          </article>
        ))}
      </div>

      {!unlocked && (
        <>
          <div className="my-8 -rotate-[0.4deg] rounded-3xl border-[3px] border-ink bg-pop-pink px-8 py-10 text-center shadow-pop-lg print:hidden">
            <h2 className="font-heavy mb-2 text-3xl uppercase">Das war 1 von {data.angles.length}!</h2>
            <p className="mx-auto mb-6 max-w-md font-medium">
              Im vollen Report: alle {data.angles.length} Angles, die Objection-Bank mit Gegenbelegen,
              {" "}{data.scrollstoppers.length > 0 ? `${data.scrollstoppers.length} Scrollstopper` : "die Scrollstopper"} und das Kundenwording-Lexikon — plus Tiefenanalyse jeder einzelnen Review.
            </p>
            <div className="flex justify-center"><BuyButton reportId={data.id} /></div>
            <p className="mt-4 text-xs font-bold">Einmalzahlung über Stripe · Report bleibt für immer unter dieser URL</p>
          </div>
          <LockedCard title="Objection-Bank" note={`${data.objections.length} Kaufbarrieren + Gegenbelege`} />
          <LockedCard title="Scrollstopper" note="Die ungewöhnlichsten, menschlichsten Zitate" />
          <LockedCard title="Wording-Lexikon" note="Kundenwörter nach Frequenz" />
        </>
      )}

      {unlocked && (
        <>
          <SectionTitle title="Objection-Bank" chip={`${data.objections.length} Barrieren`} chipBg="bg-pop-pink" />
          <p className="mb-6 text-sm font-medium">Kaufbarrieren aus kritischen Reviews — mit Gegenbelegen für L2/L3-Creatives.</p>
          <div className="space-y-5">
            {data.objections.map((o, i) => (
              <article key={i} className="rounded-3xl border-[3px] border-ink bg-white p-6 shadow-pop-sm">
                <h3 className="font-heavy mb-4 text-lg">„{o.summary}" <span className="font-sans text-xs font-bold opacity-60">· {o.mentions} Nennungen</span></h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <span className="font-heavy mb-2 inline-block rounded-full border-2 border-ink bg-pop-pink px-3 py-1 text-[11px] uppercase">Barriere</span>
                    <div className="space-y-2">{o.quotes.map((q, j) => <QuoteCard key={j} q={q} />)}</div>
                  </div>
                  <div>
                    <span className="font-heavy mb-2 inline-block rounded-full border-2 border-ink bg-pop-mint px-3 py-1 text-[11px] uppercase">Gegenbeleg</span>
                    <div className="space-y-2">
                      {o.counterQuotes.length > 0
                        ? o.counterQuotes.map((q, j) => <QuoteCard key={j} q={q} />)
                        : <p className="text-sm font-medium opacity-60">Kein sauberer Gegenbeleg im Korpus — ehrlich adressieren statt wegtexten.</p>}
                    </div>
                  </div>
                </div>
              </article>
            ))}
            {data.objections.length === 0 && <p className="text-sm font-medium">Kaum Kritik im Korpus — prüfe, ob kritische Reviews im Export enthalten sind (alle Sterne exportieren!).</p>}
          </div>

          {data.scrollstoppers.length > 0 && (
            <>
              <SectionTitle title="Scrollstopper" chip={`${data.scrollstoppers.length} Stück`} chipBg="bg-pop-yellow" />
              <p className="mb-6 text-sm font-medium">Ungewöhnlich, menschlich, lustig — Testimonial-Kandidaten.</p>
              <div className="grid gap-3 sm:grid-cols-2">
                {data.scrollstoppers.map((q, i) => (
                  <div key={i} className={i % 2 === 0 ? "-rotate-[0.7deg]" : "rotate-[0.7deg]"}>
                    <QuoteCard q={q} white={i % 2 === 1} />
                  </div>
                ))}
              </div>
            </>
          )}

          <SectionTitle title="Wording-Lexikon" chip="Kundensprache" chipBg="bg-pop-mint" />
          <p className="mb-6 text-sm font-medium">Die Wörter deiner Kunden, nach Häufigkeit (je Review einmal gezählt). Copy, die konvertiert, klingt so.</p>
          <div className="flex flex-wrap gap-2.5">
            {data.wording.kunden.map((w) => (
              <span key={w.word} className="rounded-full border-[2.5px] border-ink bg-white px-3.5 py-1.5 text-sm font-bold shadow-pop-sm">
                {w.word} <span className="ml-1 rounded-md bg-pop-yellow px-1.5 text-xs">{w.count}</span>
              </span>
            ))}
          </div>

          <SectionTitle title="Alle Themen" />
          <div className="mt-4 overflow-hidden rounded-2xl border-[3px] border-ink bg-white shadow-pop-sm">
            <table className="w-full text-sm font-medium">
              <thead className="font-heavy bg-ink text-left text-xs uppercase text-cream">
                <tr><th className="px-4 py-2.5">Thema</th><th className="px-4 py-2.5">Nennungen</th><th className="px-4 py-2.5">positiv</th></tr>
              </thead>
              <tbody>
                {data.themeCounts.map((t) => (
                  <tr key={t.theme} className="border-t-2 border-cream-2">
                    <td className="px-4 py-2">{THEME_LABELS[t.theme]}</td>
                    <td className="px-4 py-2 font-bold">{t.count}</td>
                    <td className="px-4 py-2">{t.positivePct} %</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <footer className="mt-14 border-t-[3px] border-ink pt-6 text-xs font-medium">
        Erstellt mit ANGLE MINER · Zitate mit ⚠-Flag enthalten rechtlich heikle Claims und dürfen nicht wörtlich in Werbung übernommen werden.
      </footer>
    </div>
  );
}
