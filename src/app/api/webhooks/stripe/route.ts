import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import { getStripeClient } from "@/lib/stripe";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const settings = await getSettings();
  if (!settings.stripeEnabled || !settings.stripeSecretKey) {
    return NextResponse.json({ error: "Stripe not enabled" }, { status: 400 });
  }

  const stripe = getStripeClient(settings.stripeSecretKey);
  if (!stripe) return NextResponse.json({ error: "Stripe client" }, { status: 500 });

  const signature = req.headers.get("stripe-signature");
  const rawBody = await req.text();

  let event: Stripe.Event;
  if (settings.stripeWebhookSecret && signature) {
    try {
      event = stripe.webhooks.constructEvent(rawBody, signature, settings.stripeWebhookSecret);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Bad signature";
      console.error("[Stripe Webhook] signature error", msg);
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }
  } else {
    // No webhook secret configured — parse without verification (dev only)
    try {
      event = JSON.parse(rawBody) as Stripe.Event;
    } catch {
      return NextResponse.json({ error: "Invalid body" }, { status: 400 });
    }
    console.warn("[Stripe Webhook] No signature verification (configure webhook secret)");
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
      case "checkout.session.async_payment_succeeded": {
        const session = event.data.object as Stripe.Checkout.Session;
        const orderId = session.metadata?.orderId;
        if (!orderId) break;
        await prisma.order.update({
          where: { id: orderId },
          data: {
            paymentStatus: "PAID",
            status: "CONFIRMED",
            stripeSessionId: session.id,
          },
        });
        console.log(`[Stripe Webhook] Order ${orderId} marked PAID`);
        break;
      }
      case "checkout.session.expired":
      case "checkout.session.async_payment_failed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const orderId = session.metadata?.orderId;
        if (!orderId) break;
        await prisma.order.update({
          where: { id: orderId },
          data: { paymentStatus: "FAILED" },
        });
        break;
      }
      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;
        if (charge.payment_intent && typeof charge.payment_intent === "string") {
          // Best-effort: find session by payment_intent if needed (not implemented for brevity)
        }
        break;
      }
      default:
        console.log(`[Stripe Webhook] Unhandled ${event.type}`);
    }
  } catch (err) {
    console.error("[Stripe Webhook] handler error", err);
    return NextResponse.json({ error: "Handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
