import { NextRequest, NextResponse } from "next/server";
import { markPaid } from "@/lib/store";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!secret || !key) return NextResponse.json({ error: "Stripe nicht konfiguriert" }, { status: 500 });

  const sig = req.headers.get("stripe-signature");
  if (!sig) return NextResponse.json({ error: "Signatur fehlt" }, { status: 400 });

  const { default: Stripe } = await import("stripe");
  const stripe = new Stripe(key);
  const body = await req.text();

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, secret);
  } catch {
    return NextResponse.json({ error: "Ungültige Signatur" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as { metadata?: { reportId?: string }; payment_status?: string };
    const reportId = session.metadata?.reportId;
    if (reportId && session.payment_status === "paid") {
      await markPaid(reportId);
    }
  }

  return NextResponse.json({ received: true });
}
