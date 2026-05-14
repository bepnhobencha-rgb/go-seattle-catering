import Stripe from "stripe";
import type { SiteSettings } from "@/lib/settings";

/** Get a Stripe client using the provided secret key (or undefined if no key). */
export function getStripeClient(secretKey: string) {
  if (!secretKey) return null;
  return new Stripe(secretKey);
}

type OrderWithItems = {
  id: string;
  orderNumber: string;
  email: string;
  customerName: string;
  total: number;
  tax: number;
  items: Array<{
    quantity: number;
    unitPrice: number;
    toppings: string | null;
    menuItem: { nameEn: string; code: string | null };
  }>;
};

/** Create a Stripe Checkout Session for an order. Returns the session URL. */
export async function createStripeCheckoutSession({
  order,
  settings,
  origin,
}: {
  order: OrderWithItems;
  settings: SiteSettings;
  origin: string;
}): Promise<string> {
  const stripe = getStripeClient(settings.stripeSecretKey);
  if (!stripe) throw new Error("Stripe secret key not configured");

  const currency = (settings.currency || "USD").toLowerCase();

  type CreateParams = NonNullable<Parameters<typeof stripe.checkout.sessions.create>[0]>;
  type LineItem = NonNullable<CreateParams["line_items"]>[number];

  // Each item line, plus a separate tax line item for transparency
  const line_items: LineItem[] = order.items.map((it) => {
    const toppings = it.toppings ? (JSON.parse(it.toppings) as Array<{ name: string; price: number }>) : [];
    const toppingsTotal = toppings.reduce((s, t) => s + t.price, 0);
    const unitAmount = Math.round((it.unitPrice + toppingsTotal) * 100);
    const name = it.menuItem.code
      ? `${it.menuItem.code} · ${it.menuItem.nameEn}`
      : it.menuItem.nameEn;
    const description = toppings.length ? toppings.map((t) => t.name).join(", ") : undefined;
    return {
      price_data: {
        currency,
        product_data: { name, description },
        unit_amount: unitAmount,
      },
      quantity: it.quantity,
    };
  });

  if (order.tax > 0) {
    line_items.push({
      price_data: {
        currency,
        product_data: { name: settings.taxLabel || "Sales Tax" },
        unit_amount: Math.round(order.tax * 100),
      },
      quantity: 1,
    });
  }

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items,
    customer_email: order.email,
    payment_method_types: ["card"],
    success_url: `${origin}/order/${order.orderNumber}?paid=1&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/checkout?cancelled=1`,
    metadata: {
      orderId: order.id,
      orderNumber: order.orderNumber,
    },
  });

  // Persist session id on the order
  const { prisma } = await import("@/lib/prisma");
  await prisma.order.update({
    where: { id: order.id },
    data: { stripeSessionId: session.id },
  });

  if (!session.url) throw new Error("Stripe didn't return a checkout URL");
  return session.url;
}

/** Verify Stripe is reachable with the given keys. */
export async function testStripeConnection(secretKey: string) {
  const stripe = getStripeClient(secretKey);
  if (!stripe) return { ok: false, error: "No secret key" };
  try {
    const balance = await stripe.balance.retrieve();
    const mode = secretKey.startsWith("sk_live") ? "live" : "test";
    return {
      ok: true,
      account: {
        id: balance.livemode ? "live account" : "test account",
        email: "",
        country: "",
        chargesEnabled: true,
        detailsSubmitted: true,
        mode,
      },
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { ok: false, error: msg };
  }
}
