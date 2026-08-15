import Link from "next/link";

const STEPS = [
  { n: "1", bg: "bg-pop-yellow", t: "Exportieren", d: "CSV aus Judge.me, Yotpo, Loox, Trustpilot & Co. Dauert 2 Minuten, Anleitung gibt's dazu." },
  { n: "2", bg: "bg-pop-pink", t: "Hochladen", d: "Wir putzen (Duplikate, Junk, PII), taggen jede Review einzeln und zählen in Code nach. Keine Blackbox." },
  { n: "3", bg: "bg-pop-mint", t: "Briefen", d: "Angle-Map, Objection-Bank, Scrollstopper, Kundenwording. Web + PDF, ab in die Produktion." },
];

export default function Home() {
  return (
    <main className="mx-auto max-w-5xl px-6 pb-16">
      <nav className="flex items-center justify-between py-5">
        <span className="font-heavy text-xl">
          ANGLE<span className="ml-1 inline-block -rotate-2 border-2 border-ink bg-pop-yellow px-2 shadow-pop-sm">MINER</span>
        </span>
        <div className="flex items-center gap-5 text-sm font-bold">
          <Link href="/r/demo" className="hover:underline">Beispiel</Link>
          <Link href="/new" className="pop-press rounded-full border-2 border-ink bg-pop-blue px-4 py-2 text-white shadow-pop-sm">
            Report erstellen
          </Link>
        </div>
      </nav>

      <section className="relative py-16">
        <span className="font-heavy absolute right-8 top-10 hidden rotate-6 rounded-full border-[2.5px] border-ink bg-pop-pink px-4 py-2 text-xs uppercase shadow-pop-sm sm:inline-block">
          Kein Abo!
        </span>
        <span className="font-heavy absolute right-32 top-56 hidden -rotate-3 rounded-full border-[2.5px] border-ink bg-pop-mint px-4 py-2 text-xs uppercase shadow-pop-sm sm:inline-block">
          49 € · fertig
        </span>
        <h1 className="font-heavy mb-6 max-w-3xl text-4xl uppercase leading-[1.05] tracking-tight sm:text-6xl">
          Deine Reviews wissen,{" "}
          <span className="inline-block -rotate-1 border-[2.5px] border-ink bg-pop-yellow px-2 shadow-pop-sm">was verkauft.</span>{" "}
          Wir machen sie{" "}
          <span className="inline-block rotate-1 border-[2.5px] border-ink bg-pop-blue px-2 text-white shadow-pop-sm">brieffähig.</span>
        </h1>
        <p className="mb-8 max-w-xl text-lg font-medium">
          2.000 Kundenbewertungen rein, 10 belegte Ad-Angles raus — mit Zitaten, Zahlen und Hooks.
          Das Dokument, das du Agentur oder Creator in die Hand drückst.
        </p>
        <div className="flex flex-wrap gap-4">
          <Link href="/new" className="pop-press rounded-2xl border-[3px] border-ink bg-pop-blue px-7 py-4 font-bold text-white shadow-pop">
            CSV hochladen → Gratis-Vorschau
          </Link>
          <Link href="/r/demo" className="pop-press rounded-2xl border-[3px] border-ink bg-pop-yellow px-7 py-4 font-bold shadow-pop">
            Beispiel angucken
          </Link>
        </div>
        <p className="mt-6 flex flex-wrap gap-2 text-sm font-bold">
          {["✔ Kein Login", "✔ Keine Plattform", "✔ Daten werden gelöscht"].map((t) => (
            <span key={t} className="rounded-full border-2 border-ink bg-white px-3 py-1">{t}</span>
          ))}
        </p>
      </section>

      <section className="grid gap-6 py-8 sm:grid-cols-3">
        {STEPS.map((s) => (
          <div key={s.n} className="rounded-3xl border-[3px] border-ink bg-white p-6 shadow-pop">
            <div className={`font-heavy mb-3 flex h-10 w-10 items-center justify-center rounded-full border-[2.5px] border-ink text-sm ${s.bg}`}>{s.n}</div>
            <h3 className="font-heavy mb-2 uppercase">{s.t}</h3>
            <p className="text-sm font-medium">{s.d}</p>
          </div>
        ))}
      </section>

      <section className="my-12 -rotate-[0.5deg] rounded-3xl border-[3px] border-ink bg-pop-blue p-10 text-white shadow-pop">
        <p className="font-heavy text-xl leading-snug sm:text-2xl">
          „Passform: 167 Nennungen, 78 % positiv, steigend seit März." — solche Sätze stehen drin. Nachzählbar statt halluziniert.
        </p>
        <p className="mt-4 text-sm font-bold text-pop-yellow">→ aus dem Beispiel-Report</p>
      </section>

      <section className="my-16 flex justify-center">
        <div className="relative max-w-md rounded-3xl border-[3px] border-ink bg-white px-10 py-10 text-center shadow-pop-lg">
          <span className="font-heavy absolute -right-3 -top-4 rotate-6 rounded-full border-[2.5px] border-ink bg-pop-pink px-3 py-2 text-xs uppercase shadow-pop-sm">
            Gratis-Vorschau!
          </span>
          <div className="font-heavy text-6xl">49 €</div>
          <p className="mb-5 mt-2 text-sm font-bold">pro Report · bis 5.000 Reviews · einmalig</p>
          <ul className="mb-7 text-left text-sm font-medium">
            {["Angle-Map mit Belegzitaten", "Objection-Bank mit Gegenbelegen", "15 Scrollstopper-Zitate", "Kundenwording-Lexikon", "Compliance-Flags (EmpCo-ready)", "Web-Report + PDF"].map((f) => (
              <li key={f} className="border-b-2 border-dashed border-cream-2 py-2">
                <span className="font-bold text-pop-mint">✔</span> {f}
              </li>
            ))}
          </ul>
          <Link href="/new" className="pop-press inline-block rounded-2xl border-[3px] border-ink bg-pop-pink px-8 py-4 font-bold shadow-pop">
            Los geht's
          </Link>
        </div>
      </section>

      <footer className="border-t-[3px] border-ink pt-8 text-sm font-medium">
        ANGLE MINER · Impressum · Datenschutz · Deine Reviews bleiben deine Daten: Rohdaten werden nach der Analyse gelöscht.
      </footer>
    </main>
  );
}
