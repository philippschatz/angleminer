import { NextRequest, NextResponse } from "next/server";
import { getReport, markPaid } from "@/lib/store";

export const runtime = "nodejs";

const PRICE_EUR_CENTS = 4900;

export async function POST(req: NextRequest) {
  const { reportId } = (await req.json()) as { reportId?: string };
  if (!reportId) return NextResponse.json({ error: "reportId fehlt" }, { status: 400 });
  const report = await getReport(reportId);
  if (!report) return NextResponse.json({ error: "Report nicht gefunden" }, { status: 404 });
  if (report.paid) return NextResponse.json({ url: `/r/${reportId}` });

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || req.nextUrl.origin;

  // Dev-Modus ohne Stripe-Key: direkt freischalten, damit der Flow lokal testbar ist.
  if (!process.env.STRIPE_SECRET_KEY) {
    await markPaid(reportId);
    return NextResponse.json({ url: `${baseUrl}/r/${reportId}?dev_paid=1` });
  }

  const { default: Stripe } = await import("stripe");
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: [{
      price_data: {
        currency: "eur",
        unit_amount: PRICE_EUR_CENTS,
        product_data: {
          name: `VoC-Report: ${report.data.brandName}`,
          description: `${report.data.totalAnalyzed} Reviews → Angle-Map, Objection-Bank, Scrollstopper, Wording-Lexikon`,
        },
      },
      quantity: 1,
    }],
    customer_email: report.email,
    metadata: { reportId },
    success_url: `${baseUrl}/r/${reportId}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/r/${reportId}`,
    automatic_tax: { enabled: process.env.STRIPE_AUTOMATIC_TAX === "1" },
  });

  return NextResponse.json({ url: session.url });
}
