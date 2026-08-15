import { NextRequest, NextResponse } from "next/server";
import { markPaid } from "@/lib/store";

export const runtime = "nodejs";

// Schaltet den Report frei und legt das Kundenkonto an.
//
// Der Webhook rechnet selbst nichts — er antwortet schnell und überlässt die
// Tiefenanalyse dem Zeitplan (/api/cron/verarbeiten). Stripe bricht Webhooks
// ab, die zu lange brauchen; eine Analyse von 5.000 Bewertungen gehört hier
// nicht hinein.

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
    const session = event.data.object as {
      id: string;
      metadata?: { reportId?: string };
      payment_status?: string;
      customer_email?: string | null;
      customer_details?: { email?: string | null } | null;
    };
    const reportId = session.metadata?.reportId;
    if (reportId && session.payment_status === "paid") {
      // Adresse aus dem Formular gewinnt; sonst die, die Stripe ohnehin erhebt.
      const email = session.customer_details?.email || session.customer_email || undefined;
      await markPaid(reportId, { email: email ?? undefined, stripeSessionId: session.id });
    }
  }

  return NextResponse.json({ received: true });
}
