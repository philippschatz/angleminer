import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { z } from "zod";
import { heuristicTag } from "@/lib/pipeline/tagger";
import { buildReport } from "@/lib/pipeline/aggregate";
import { RawReview, QUELLEN } from "@/lib/pipeline/types";
import { saveReport } from "@/lib/store";
import { MAX_REVIEWS, MIN_NACH_REINIGUNG } from "@/lib/pipeline/browser";
import { fehler, upload as uploadCopy } from "@/content/copy";
import { einwilligungStarten } from "@/lib/newsletter";

export const runtime = "nodejs";
export const maxDuration = 60;

// Nimmt die im Browser bereinigten Bewertungen entgegen, legt den Report an und
// startet den Checkout. Erst ab hier liegen überhaupt Daten bei uns — und zwar
// nur Text, Sterne und Datum. Keine Namen, keine Mailadressen, keine
// Bestellnummern: die hat der Browser des Kunden vorher entfernt.

const PREIS_CENT = 4900;

const ReviewSchema = z.object({
  id: z.string().max(40),
  text: z.string().min(1).max(4000),
  rating: z.number().min(0).max(5).optional(),
  date: z.string().max(20).optional(),
  quelle: z.enum(QUELLEN).optional(),
});

const BodySchema = z.object({
  brandName: z.string().max(80),
  category: z.string().max(80),
  email: z.string().max(200).optional(),
  werbeEinwilligung: z.boolean().optional(),
  cleanStats: z.object({
    input: z.number().int().min(0),
    kept: z.number().int().min(0),
    duplicates: z.number().int().min(0),
    junk: z.number().int().min(0),
    piiScrubbed: z.number().int().min(0),
    seedingAlert: z.array(z.object({ body: z.string().max(200), count: z.number().int() })).nullable(),
  }),
  reviews: z.array(ReviewSchema).min(MIN_NACH_REINIGUNG).max(MAX_REVIEWS),
});

export async function POST(req: NextRequest) {
  let body: z.infer<typeof BodySchema>;
  try {
    body = BodySchema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: fehler.uploadUngueltig }, { status: 400 });
  }

  try {
    const roh: RawReview[] = body.reviews.map((r) => ({
      id: r.id,
      body: r.text,
      rating: r.rating,
      date: r.date,
      quelle: r.quelle,
    }));

    const id = nanoid(12);
    const tagged = heuristicTag(roh);
    const data = buildReport({
      id,
      tagged,
      cleanStats: body.cleanStats,
      brandName: body.brandName.trim() || uploadCopy.standardMarke,
      category: body.category.trim() || uploadCopy.standardKategorie,
      email: body.email,
      llmEnhanced: false,
    });

    await saveReport({
      id,
      status: "preview",
      paid: false,
      email: body.email,
      data,
      rawReviews: roh,
      createdAt: new Date().toISOString(),
    });

    // Werbe-Einwilligung ist vom Kauf getrennt: eigene Zustimmung, eigene
    // Bestätigungsmail. Scheitert sie, darf das den Kauf nicht aufhalten.
    if (body.werbeEinwilligung && body.email) {
      try {
        await einwilligungStarten(body.email, "kauf", req.nextUrl.origin);
      } catch (e) {
        console.error("Einwilligung konnte nicht gestartet werden", e);
      }
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || req.nextUrl.origin;

    // Ohne Stripe-Key (Dev): direkt freischalten — inklusive Kontoanlage, damit
    // der lokale Ablauf demselben Weg folgt wie der echte über den Webhook.
    if (!process.env.STRIPE_SECRET_KEY) {
      const { markPaid } = await import("@/lib/store");
      await markPaid(id, { email: body.email });
      return NextResponse.json({ id, url: `${baseUrl}/r/${id}?dev_paid=1` });
    }

    const { default: Stripe } = await import("stripe");
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [{
        price_data: {
          currency: "eur",
          unit_amount: PREIS_CENT,
          product_data: {
            name: `VoC-Report: ${data.brandName}`,
            description: `${data.totalAnalyzed} Bewertungen → Angle-Map, Einwand-Bank, Scrollstopper, Wortliste`,
          },
        },
        quantity: 1,
      }],
      customer_email: body.email,
      metadata: { reportId: id },
      success_url: `${baseUrl}/r/${id}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/r/${id}`,
      automatic_tax: { enabled: process.env.STRIPE_AUTOMATIC_TAX === "1" },
    });

    return NextResponse.json({ id, url: session.url });
  } catch (e) {
    console.error("report anlegen fehlgeschlagen", e);
    return NextResponse.json({ error: fehler.analyseFehlgeschlagen }, { status: 500 });
  }
}
