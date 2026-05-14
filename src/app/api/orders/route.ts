import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { calcTax, genOrderNumber } from "@/lib/utils";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getSettings } from "@/lib/settings";
import { createStripeCheckoutSession } from "@/lib/stripe";

const Topping = z.object({
  id: z.string(),
  name: z.string(),
  price: z.number().nonnegative(),
});

const Item = z.object({
  menuItemId: z.string(),
  quantity: z.number().int().min(1).max(50),
  unitPrice: z.number().nonnegative(),
  toppings: z.array(Topping).default([]),
  notes: z.string().optional(),
});

const Body = z.object({
  name: z.string().min(1).max(120),
  phone: z.string().min(3).max(40),
  email: z.string().email(),
  pickupAt: z.string(),
  notes: z.string().optional(),
  paymentMethod: z.enum(["PICKUP", "STRIPE"]).default("PICKUP"),
  items: z.array(Item).min(1).max(50),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = Body.parse(body);
    const settings = await getSettings();

    const pickupAt = new Date(data.pickupAt);
    if (isNaN(pickupAt.getTime())) {
      return NextResponse.json({ error: "Invalid pickup time" }, { status: 400 });
    }
    const minMs = (settings.minPickupMinutes - 5) * 60 * 1000; // 5-min grace
    if (pickupAt.getTime() < Date.now() + minMs) {
      return NextResponse.json(
        { error: `Pickup must be at least ${settings.minPickupMinutes} minutes from now` },
        { status: 400 }
      );
    }

    // Verify items exist and compute subtotal server-side
    const ids = data.items.map((i) => i.menuItemId);
    const menuItems = await prisma.menuItem.findMany({ where: { id: { in: ids }, isActive: true } });
    const menuMap = new Map(menuItems.map((m) => [m.id, m]));

    let subtotal = 0;
    for (const i of data.items) {
      const mi = menuMap.get(i.menuItemId);
      if (!mi) {
        return NextResponse.json({ error: "Menu item not available" }, { status: 400 });
      }
      const topT = i.toppings.reduce((s, t) => s + t.price, 0);
      subtotal += (mi.basePrice + topT) * i.quantity;
    }
    subtotal = Math.round(subtotal * 100) / 100;
    const tax = calcTax(subtotal, settings.taxRate);
    const total = Math.round((subtotal + tax) * 100) / 100;

    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    const orderNumber = genOrderNumber();

    // Decide payment method
    const wantsStripe = data.paymentMethod === "STRIPE" && settings.stripeEnabled && settings.stripeSecretKey;
    const paymentMethod = wantsStripe ? "STRIPE" : "PICKUP";

    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: userId ?? null,
        customerName: data.name,
        phone: data.phone,
        email: data.email,
        pickupAt,
        notes: data.notes,
        subtotal,
        tax,
        total,
        status: "PENDING",
        paymentMethod,
        paymentStatus: "UNPAID",
        items: {
          create: data.items.map((i) => {
            const mi = menuMap.get(i.menuItemId)!;
            return {
              menuItemId: mi.id,
              quantity: i.quantity,
              unitPrice: mi.basePrice,
              toppings: i.toppings.length ? JSON.stringify(i.toppings) : null,
              notes: i.notes,
            };
          }),
        },
      },
      include: { items: { include: { menuItem: true } } },
    });

    // If Stripe, create checkout session and return URL for redirect
    if (paymentMethod === "STRIPE") {
      try {
        const checkoutUrl = await createStripeCheckoutSession({
          order,
          settings,
          origin: new URL(req.url).origin,
        });
        return NextResponse.json({
          ok: true,
          orderNumber: order.orderNumber,
          id: order.id,
          checkoutUrl,
        });
      } catch (err) {
        console.error("[Stripe] create session failed", err);
        // Fall back to PICKUP if Stripe fails
        await prisma.order.update({
          where: { id: order.id },
          data: { paymentMethod: "PICKUP" },
        });
        return NextResponse.json({
          ok: true,
          orderNumber: order.orderNumber,
          id: order.id,
          fallback: "PICKUP",
        });
      }
    }

    console.log(`[Order] ${orderNumber} from ${data.email}, total ${total}`);

    return NextResponse.json({ ok: true, orderNumber: order.orderNumber, id: order.id });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request", issues: err.issues }, { status: 400 });
    }
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
