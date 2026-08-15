import { notFound } from "next/navigation";
import Link from "next/link";
import { getReport, markPaid } from "@/lib/store";
import ReportView from "@/components/ReportView";
import ProcessUpgrade from "@/components/ProcessUpgrade";
import PrintButton from "@/components/PrintButton";

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
  if (!report) notFound();

  if (!report.paid && session_id) {
    const ok = await verifyStripeSession(session_id, id);
    if (ok) {
      await markPaid(id);
      report = (await getReport(id))!;
    }
  }

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
      {needsUpgrade && <ProcessUpgrade reportId={id} />}
      <ReportView data={report.data} unlocked={unlocked} />
    </main>
  );
}
