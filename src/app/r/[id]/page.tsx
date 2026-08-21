import { notFound } from "next/navigation";
import Link from "next/link";
import { getReport, markPaid } from "@/lib/store";
import ReportView from "@/components/ReportView";
import { report as t } from "@/content/copy";
import { demoReport } from "@/content/demo-report";
import ProcessUpgrade from "@/components/ProcessUpgrade";
import PrintButton from "@/components/PrintButton";
import BuyButton from "@/components/BuyButton";

export const dynamic = "force-dynamic";

// Fallback, falls der Webhook langsamer ist als der Redirect von Stripe.
async function verifyStripeSession(sessionId: string, reportId: string): Promise<boolean> {
  if (!process.env.STRIPE_SECRET_KEY) return false;
  try {
    const { default: Stripe } = await import("stripe");
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    return session.payment_status === "paid" && session.metadata?.reportId === reportId;
  } catch {
    return false;
  }
}

export default async function ReportPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { id } = await params;
  const { session_id } = await searchParams;

  let report = await getReport(id);

  // Der Beispiel-Report liegt als fertiges Dokument im Code. So ist /r/demo in
  // jeder Umgebung sofort erreichbar — auch bevor irgendetwas geseedet wurde.
  if (!report && id === "demo") {
    report = {
      id: "demo", status: "ready", paid: true, data: demoReport,
      createdAt: demoReport.createdAt,
    };
  }
  if (!report) notFound();

  if (!report.paid && session_id) {
    const ok = await verifyStripeSession(session_id, id);
    if (ok) {
      await markPaid(id);
      report = (await getReport(id))!;
    }
  }

  const istDemo = id === "demo";
  const unlocked = report.paid;
  const needsUpgrade = report.paid && report.status !== "ready";

  return (
    <main className="mx-auto max-w-4xl px-6 py-8">
      <nav className="mb-8 flex items-center justify-between print:hidden">
        <Link href="/" className="font-heavy text-base">
          ANGLE<span className="ml-1 inline-block -rotate-2 border-2 border-ink bg-pop-yellow px-1.5 text-sm shadow-pop-sm">MINER</span>
        </Link>
        {unlocked && <PrintButton />}
      </nav>
      {istDemo && (
        <p className="mb-8 rounded-2xl border-[3px] border-ink bg-pop-blue px-5 py-4 text-sm font-medium text-white shadow-pop-sm print:hidden">
          {t.demoBanner}
        </p>
      )}
      {needsUpgrade && <ProcessUpgrade reportId={id} />}
      <ReportView data={report.data} unlocked={unlocked} kaufBereich={<BuyButton reportId={id} />} />

      {istDemo && (
        <section className="my-12 -rotate-[0.4deg] rounded-3xl border-[3px] border-ink bg-pop-pink px-8 py-10 text-center shadow-pop-lg print:hidden">
          <h2 className="font-heavy mb-2 text-3xl uppercase">{t.demoCtaTitel}</h2>
          <p className="mx-auto mb-6 max-w-md font-medium">{t.demoCtaText}</p>
          <Link href="/new" className="pop-press inline-block rounded-2xl border-[3px] border-ink bg-pop-yellow px-8 py-4 font-bold shadow-pop">
            {t.demoCtaButton}
          </Link>
          <p className="mt-4 text-xs font-bold">{t.demoCtaFussnote}</p>
        </section>
      )}
    </main>
  );
}
