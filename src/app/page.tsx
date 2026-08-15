import Link from "next/link";
import { start } from "@/content/copy";

// Alle Texte dieser Seite stehen in src/content/copy.ts unter "start".
const STEP_BGS = ["bg-pop-yellow", "bg-pop-pink", "bg-pop-mint"];

export default function Home() {
  return (
    <main className="mx-auto max-w-5xl px-6 pb-16">
      <nav className="flex items-center justify-between py-5">
        <span className="font-heavy text-xl">
          ANGLE<span className="ml-1 inline-block -rotate-2 border-2 border-ink bg-pop-yellow px-2 shadow-pop-sm">MINER</span>
        </span>
        <div className="flex items-center gap-5 text-sm font-bold">
          <Link href="/r/demo" className="hover:underline">{start.navBeispiel}</Link>
          <Link href="/new" className="pop-press rounded-full border-2 border-ink bg-pop-blue px-4 py-2 text-white shadow-pop-sm">
            {start.navCta}
          </Link>
        </div>
      </nav>

      <section className="relative py-16">
        <span className="font-heavy absolute right-8 top-10 hidden rotate-6 rounded-full border-[2.5px] border-ink bg-pop-pink px-4 py-2 text-xs uppercase shadow-pop-sm sm:inline-block">
          {start.stickerOben}
        </span>
        <span className="font-heavy absolute right-32 top-56 hidden -rotate-3 rounded-full border-[2.5px] border-ink bg-pop-mint px-4 py-2 text-xs uppercase shadow-pop-sm sm:inline-block">
          {start.stickerUnten}
        </span>
        <h1 className="font-heavy mb-6 max-w-3xl text-4xl uppercase leading-[1.05] tracking-tight sm:text-6xl">
          {start.h1Teil1}{" "}
          <span className="inline-block -rotate-1 border-[2.5px] border-ink bg-pop-yellow px-2 shadow-pop-sm">{start.h1Markiert1}</span>{" "}
          {start.h1Teil2}{" "}
          <span className="inline-block rotate-1 border-[2.5px] border-ink bg-pop-blue px-2 text-white shadow-pop-sm">{start.h1Markiert2}</span>
        </h1>
        <p className="mb-8 max-w-xl text-lg font-medium">{start.subline}</p>
        <div className="flex flex-wrap gap-4">
          <Link href="/new" className="pop-press rounded-2xl border-[3px] border-ink bg-pop-blue px-7 py-4 font-bold text-white shadow-pop">
            {start.ctaPrimaer}
          </Link>
          <Link href="/r/demo" className="pop-press rounded-2xl border-[3px] border-ink bg-pop-yellow px-7 py-4 font-bold shadow-pop">
            {start.ctaSekundaer}
          </Link>
        </div>
        <p className="mt-6 flex flex-wrap gap-2 text-sm font-bold">
          {start.vertrauensPunkte.map((t) => (
            <span key={t} className="rounded-full border-2 border-ink bg-white px-3 py-1">✔ {t}</span>
          ))}
        </p>
      </section>

      <section className="grid gap-6 py-8 sm:grid-cols-3">
        {start.schritte.map((s, i) => (
          <div key={s.titel} className="rounded-3xl border-[3px] border-ink bg-white p-6 shadow-pop">
            <div className={`font-heavy mb-3 flex h-10 w-10 items-center justify-center rounded-full border-[2.5px] border-ink text-sm ${STEP_BGS[i]}`}>{i + 1}</div>
            <h3 className="font-heavy mb-2 uppercase">{s.titel}</h3>
            <p className="text-sm font-medium">{s.text}</p>
          </div>
        ))}
      </section>

      <section className="my-12 -rotate-[0.5deg] rounded-3xl border-[3px] border-ink bg-pop-blue p-10 text-white shadow-pop">
        <p className="font-heavy text-xl leading-snug sm:text-2xl">
          „{start.beweisZitat}" {start.beweisText}
        </p>
        <p className="mt-4 text-sm font-bold text-pop-yellow">{start.beweisQuelle}</p>
      </section>

      <section className="my-16 flex justify-center">
        <div className="relative max-w-md rounded-3xl border-[3px] border-ink bg-white px-10 py-10 text-center shadow-pop-lg">
          <span className="font-heavy absolute -right-3 -top-4 rotate-6 rounded-full border-[2.5px] border-ink bg-pop-pink px-3 py-2 text-xs uppercase shadow-pop-sm">
            {start.preisSticker}
          </span>
          <div className="font-heavy text-6xl">{start.preisBetrag}</div>
          <p className="mb-5 mt-2 text-sm font-bold">{start.preisZusatz}</p>
          <ul className="mb-7 text-left text-sm font-medium">
            {start.preisLeistungen.map((f) => (
              <li key={f} className="border-b-2 border-dashed border-cream-2 py-2">
                <span className="font-bold text-pop-mint">✔</span> {f}
              </li>
            ))}
          </ul>
          <Link href="/new" className="pop-press inline-block rounded-2xl border-[3px] border-ink bg-pop-pink px-8 py-4 font-bold shadow-pop">
            {start.preisCta}
          </Link>
        </div>
      </section>

      <footer className="border-t-[3px] border-ink pt-8 text-sm font-medium">{start.fusszeile}</footer>
    </main>
  );
}
