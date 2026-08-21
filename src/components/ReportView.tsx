import type { ReactNode } from "react";
import { QUELLE_KURZ, QUELLE_LABELS, Quote, ReportData, THEME_LABELS } from "@/lib/pipeline/types";
import { fill, report as t } from "@/content/copy";

// Alle Texte dieses Reports stehen in src/content/copy.ts unter "report".

function QuoteCard({ q, white }: { q: Quote; white?: boolean }) {
  return (
    <blockquote className={`rounded-2xl border-[2.5px] border-ink ${white ? "bg-white" : "bg-cream"} p-4 text-sm font-medium`}>
      <p>„{q.text}"</p>
      <footer className="mt-2 flex flex-wrap items-center gap-2 text-xs font-bold opacity-60">
        {q.quelle && q.quelle !== "bewertung" && (
          <span className="rounded-md border border-ink bg-cream-2 px-1.5 py-0.5 not-italic">
            {QUELLE_KURZ[q.quelle]}
          </span>
        )}
        {q.author && <span>{q.author}</span>}
        {q.rating !== undefined && <span>· {q.rating}★</span>}
        {q.date && <span>· {q.date}</span>}
      </footer>
      {q.complianceFlags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {q.complianceFlags.map((f) => (
            <span key={f} className="rounded-lg border-2 border-ink bg-pop-yellow px-2 py-0.5 text-[11px] font-bold">
              {fill(t.flagHinweis, { label: t.flagLabels[f] ?? f })}
            </span>
          ))}
        </div>
      )}
    </blockquote>
  );
}

function TrendBadge({ trend }: { trend: string }) {
  if (trend === "steigend") return <span className="rounded-full border-2 border-ink bg-pop-mint px-2.5 py-0.5 text-[11px] font-bold uppercase">{t.trendSteigend}</span>;
  if (trend === "fallend") return <span className="rounded-full border-2 border-ink bg-pop-pink px-2.5 py-0.5 text-[11px] font-bold uppercase">{t.trendFallend}</span>;
  if (trend === "stabil") return <span className="rounded-full border-2 border-ink bg-cream px-2.5 py-0.5 text-[11px] font-bold uppercase">{t.trendStabil}</span>;
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

export default function ReportView({
  data,
  unlocked,
  kaufBereich,
}: {
  data: ReportData;
  unlocked: boolean;
  /** Kauf-Button für die Vorschau. Unterscheidet sich je nachdem, ob der Report
   *  schon angelegt ist (/r/…) oder erst beim Klick entsteht (/new). */
  kaufBereich?: ReactNode;
}) {
  const previewAngles = unlocked ? data.angles : data.angles.slice(0, 1);
  const s = data.cleanStats;
  const kpis = [
    { v: String(data.totalAnalyzed), l: t.kpiBewertungen },
    { v: data.ratingAvg ? `${data.ratingAvg.toFixed(1).replace(".", ",")}★` : "—", l: t.kpiSterne },
    { v: `${Math.round(((data.sentimentSplit.positiv || 0) / Math.max(1, data.totalAnalyzed)) * 100)} %`, l: t.kpiPositiv },
    { v: String(data.objections.reduce((a, o) => a + o.mentions, 0)), l: t.kpiEinwaende },
  ];

  return (
    <div>
      <header className="pt-2">
        <span className={`font-heavy inline-block -rotate-1 rounded-full border-2 border-ink px-4 py-1.5 text-xs uppercase shadow-pop-sm ${unlocked ? "bg-pop-mint" : "bg-pop-yellow"}`}>
          {unlocked ? t.badgeVoll : t.badgeVorschau}
        </span>
        <h1 className="font-heavy mt-4 text-4xl uppercase tracking-tight">{data.brandName}</h1>
        <p className="mt-1 text-sm font-bold">
          {fill(t.untertitel, { kategorie: data.category, datum: new Date(data.createdAt).toLocaleDateString("de-DE") })}
        </p>
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
        <b>{t.datenbasisTitel}</b>{" "}
        {fill(t.datenbasisText, { eingelesen: s.input, leer: s.junk, doppelt: s.duplicates, pii: s.piiScrubbed })}
        {s.seedingAlert && (
          <span className="mt-2 block rounded-xl border-2 border-ink bg-pop-yellow px-3 py-2 text-[13px] font-bold">
            {fill(t.seedingWarnung, { liste: s.seedingAlert.map((x) => `„${x.body}…" (${x.count}×)`).join(" · ") })}
          </span>
        )}
        {!data.llmEnhanced && unlocked && (
          <span className="mt-2 block text-xs opacity-60">{t.heuristikHinweis}</span>
        )}
      </section>

      <SectionTitle
        title={t.angleTitel}
        chip={unlocked
          ? fill(t.angleChipVoll, { anzahl: data.angles.length })
          : fill(t.angleChipVorschau, { anzahl: data.angles.length })}
      />
      <p className="mb-6 text-sm font-medium">{t.angleText}</p>

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
              <span className="rounded-md bg-pop-yellow px-1.5">{fill(t.angleNennungen, { anzahl: a.mentions })}</span> ({a.sharePct} %) · {a.positivePct} % positiv
            </p>
            <div className="mb-4 grid gap-3 sm:grid-cols-2">
              {a.quotes.map((q, j) => <QuoteCard key={j} q={q} />)}
            </div>
            {a.hooks.length > 0 && (
              <div className="rounded-2xl bg-ink p-5 text-cream">
                <p className="font-heavy mb-2 text-[11px] uppercase tracking-wide text-pop-yellow">{t.hookTitel}</p>
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
            <h2 className="font-heavy mb-2 text-3xl uppercase">{fill(t.paywallTitel, { anzahl: data.angles.length })}</h2>
            <p className="mx-auto mb-6 max-w-md font-medium">
              {fill(t.paywallText, { anzahl: data.angles.length, scrollstopper: data.scrollstoppers.length })}
            </p>
            <div className="flex justify-center">{kaufBereich}</div>
            <p className="mt-4 text-xs font-bold">{t.paywallFussnote}</p>
          </div>
          <LockedCard title={t.gesperrtEinwaendeTitel} note={fill(t.gesperrtEinwaendeNotiz, { anzahl: data.objections.length })} />
          <LockedCard title={t.gesperrtScrollstopperTitel} note={t.gesperrtScrollstopperNotiz} />
          <LockedCard title={t.gesperrtWortlisteTitel} note={t.gesperrtWortlisteNotiz} />
        </>
      )}

      {unlocked && (
        <>
          <SectionTitle title={t.einwaendeTitel} chip={fill(t.einwaendeChip, { anzahl: data.objections.length })} chipBg="bg-pop-pink" />
          <p className="mb-6 text-sm font-medium">{t.einwaendeText}</p>
          <div className="space-y-5">
            {data.objections.map((o, i) => (
              <article key={i} className="rounded-3xl border-[3px] border-ink bg-white p-6 shadow-pop-sm">
                <h3 className="font-heavy mb-4 text-lg">
                  „{o.summary}" <span className="font-sans text-xs font-bold opacity-60">{fill(t.einwaendeNennungen, { anzahl: o.mentions })}</span>
                </h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <span className="font-heavy mb-2 inline-block rounded-full border-2 border-ink bg-pop-pink px-3 py-1 text-[11px] uppercase">{t.labelBarriere}</span>
                    <div className="space-y-2">{o.quotes.map((q, j) => <QuoteCard key={j} q={q} />)}</div>
                  </div>
                  <div>
                    <span className="font-heavy mb-2 inline-block rounded-full border-2 border-ink bg-pop-mint px-3 py-1 text-[11px] uppercase">{t.labelGegenbeleg}</span>
                    <div className="space-y-2">
                      {o.counterQuotes.length > 0
                        ? o.counterQuotes.map((q, j) => <QuoteCard key={j} q={q} />)
                        : <p className="text-sm font-medium opacity-60">{t.keinGegenbeleg}</p>}
                    </div>
                  </div>
                </div>
              </article>
            ))}
            {data.objections.length === 0 && <p className="text-sm font-medium">{t.keineEinwaende}</p>}
          </div>

          {data.scrollstoppers.length > 0 && (
            <>
              <SectionTitle title={t.scrollstopperTitel} chip={fill(t.scrollstopperChip, { anzahl: data.scrollstoppers.length })} chipBg="bg-pop-yellow" />
              <p className="mb-6 text-sm font-medium">{t.scrollstopperText}</p>
              <div className="grid gap-3 sm:grid-cols-2">
                {data.scrollstoppers.map((q, i) => (
                  <div key={i} className={i % 2 === 0 ? "-rotate-[0.7deg]" : "rotate-[0.7deg]"}>
                    <QuoteCard q={q} white={i % 2 === 1} />
                  </div>
                ))}
              </div>
            </>
          )}

          <SectionTitle title={t.wortlisteTitel} chip={t.wortlisteChip} chipBg="bg-pop-mint" />
          <p className="mb-6 text-sm font-medium">{t.wortlisteText}</p>
          <div className="flex flex-wrap gap-2.5">
            {data.wording.kunden.map((w) => (
              <span key={w.word} className="rounded-full border-[2.5px] border-ink bg-white px-3.5 py-1.5 text-sm font-bold shadow-pop-sm">
                {w.word} <span className="ml-1 rounded-md bg-pop-yellow px-1.5 text-xs">{w.count}</span>
              </span>
            ))}
          </div>

          {(data.quellenluecken?.length ?? 0) > 0 && (
            <>
              <SectionTitle
                title={t.lueckenTitel}
                chip={fill(t.lueckenChip, { anzahl: data.quellenluecken!.length })}
                chipBg="bg-ink text-pop-yellow"
              />
              <p className="mb-6 text-sm font-medium">{t.lueckenText}</p>
              <div className="space-y-5">
                {data.quellenluecken!.map((l) => {
                  const spitze = l.jeQuelle.find((q) => q.quelle === l.auffaelligste);
                  const bew = l.jeQuelle.find((q) => q.quelle === "bewertung");
                  return (
                    <article key={l.theme} className="rounded-3xl border-[3px] border-ink bg-white p-6 shadow-pop-sm">
                      <div className="mb-3 flex flex-wrap items-center gap-3">
                        <h3 className="font-heavy text-lg">{THEME_LABELS[l.theme]}</h3>
                        <span className="font-heavy rounded-full border-2 border-ink bg-pop-pink px-3 py-1 text-[11px] uppercase">
                          {fill(t.lueckenAbstand, { punkte: l.mehrAlsBewertungen })}
                        </span>
                      </div>
                      <p className="mb-4 text-sm font-bold">
                        {fill(t.lueckenZeile, {
                          anteil: spitze?.anteilPct ?? 0,
                          quelle: QUELLE_LABELS[l.auffaelligste],
                          bewertungen: bew?.anteilPct ?? 0,
                        })}
                      </p>
                      <div className="grid gap-3 sm:grid-cols-2">
                        {l.quotes.map((q, j) => <QuoteCard key={j} q={q} />)}
                      </div>
                    </article>
                  );
                })}
              </div>
              {(data.quellenSplit?.length ?? 0) > 1 && (
                <p className="mt-4 text-xs font-medium opacity-70">
                  {fill(t.lueckenGrundwert, {
                    liste: data.quellenSplit!
                      .map((q) => fill(t.lueckenGrundwertTeil, {
                        quelle: QUELLE_LABELS[q.quelle], anzahl: q.count, positiv: q.positivPct,
                      }))
                      .join(" · "),
                  })}
                </p>
              )}
            </>
          )}

          <SectionTitle title={t.themenTitel} />
          <div className="mt-4 overflow-hidden rounded-2xl border-[3px] border-ink bg-white shadow-pop-sm">
            <table className="w-full text-sm font-medium">
              <thead className="font-heavy bg-ink text-left text-xs uppercase text-cream">
                <tr>
                  <th className="px-4 py-2.5">{t.themenSpalteThema}</th>
                  <th className="px-4 py-2.5">{t.themenSpalteNennungen}</th>
                  <th className="px-4 py-2.5">{t.themenSpaltePositiv}</th>
                </tr>
              </thead>
              <tbody>
                {data.themeCounts.map((th) => (
                  <tr key={th.theme} className="border-t-2 border-cream-2">
                    <td className="px-4 py-2">{THEME_LABELS[th.theme]}</td>
                    <td className="px-4 py-2 font-bold">{th.count}</td>
                    <td className="px-4 py-2">{th.positivePct} %</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <footer className="mt-14 border-t-[3px] border-ink pt-6 text-xs font-medium">{t.fusszeile}</footer>
    </div>
  );
}
