import { prisma } from "@/lib/prisma";
import { formatUSD } from "@/lib/utils";
import { ORDER_STATUS_LABEL, ORDER_STATUS_COLOR, type OrderStatus } from "@/lib/enums";
import { CheckCircle2, Clock, MapPin, CreditCard, Banknote } from "lucide-react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { maintenanceGate } from "@/lib/maintenance";

export const revalidate = 0;

export default async function OrderConfirmation({
  params,
  searchParams,
}: {
  params: { orderNumber: string };
  searchParams: { paid?: string };
}) {
  const order = await prisma.order.findUnique({
    where: { orderNumber: params.orderNumber },
    include: { items: { include: { menuItem: true } } },
  });
  if (!order) notFound();

  // If we just returned from Stripe successful checkout and DB still says UNPAID,
  // optimistically flip it (webhook will reconcile authoritatively).
  let paymentStatus = order.paymentStatus;
  if (searchParams.paid === "1" && paymentStatus === "UNPAID" && order.paymentMethod === "STRIPE") {
    await prisma.order.update({
      where: { id: order.id },
      data: { paymentStatus: "PAID" },
    });
    paymentStatus = "PAID";
  }

  const status = order.status as OrderStatus;
  const settings = await maintenanceGate();
  const isStripe = order.paymentMethod === "STRIPE";
  const isPaid = paymentStatus === "PAID";

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto rounded-full bg-gold-gradient flex items-center justify-center text-ink-900">
          <CheckCircle2 className="w-9 h-9" />
        </div>
        <h1 className="font-display text-4xl font-bold mt-4">
          Order <span className="text-gold-gradient">confirmed</span>
        </h1>
        <p className="text-cream/70 mt-2">Thank you, {order.customerName}!</p>
        <p className="text-sm text-cream/60 mt-1">
          Order number: <span className="font-mono text-gold-300">{order.orderNumber}</span>
        </p>
      </div>

      <div className="card p-6 mt-8 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-gold-200 font-semibold">Status</span>
          <span className={`px-3 py-1 rounded-full text-xs font-bold border ${ORDER_STATUS_COLOR[status]}`}>
            {ORDER_STATUS_LABEL[status]}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gold-200 font-semibold flex items-center gap-2">
            {isStripe ? <CreditCard className="w-4 h-4" /> : <Banknote className="w-4 h-4" />}
            Payment
          </span>
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold border ${
              isPaid
                ? "bg-green-500/15 text-green-300 border-green-500/40"
                : "bg-yellow-500/15 text-yellow-300 border-yellow-500/40"
            }`}
          >
            {isStripe ? (isPaid ? "Paid online" : "Awaiting payment") : "Pay at pickup"}
          </span>
        </div>
        <div className="flex items-center gap-2 text-cream/85 text-sm">
          <Clock className="w-4 h-4 text-gold-400" />
          Pickup: {new Date(order.pickupAt).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}
        </div>
        <div className="flex items-center gap-2 text-cream/85 text-sm">
          <MapPin className="w-4 h-4 text-gold-400" />
          {settings.address}{settings.address && settings.phone ? " · " : ""}{settings.phone}
        </div>
      </div>

      <div className="card p-6 mt-5">
        <h2 className="font-display text-xl font-bold text-gold-200 mb-3">Items</h2>
        <ul className="divide-y divide-gold-900/40 text-sm">
          {order.items.map((it) => {
            const toppings = it.toppings ? (JSON.parse(it.toppings) as { name: string; price: number }[]) : [];
            return (
              <li key={it.id} className="py-3 flex justify-between gap-3">
                <div>
                  <p className="text-cream">{it.quantity}× {it.menuItem.nameEn}</p>
                  {toppings.length > 0 && (
                    <p className="text-xs text-gold-300/70">+ {toppings.map((t) => t.name).join(", ")}</p>
                  )}
                  {it.notes && <p className="text-xs text-cream/55 italic">Note: {it.notes}</p>}
                </div>
                <span className="text-cream shrink-0">
                  {formatUSD((it.unitPrice + toppings.reduce((s, t) => s + t.price, 0)) * it.quantity)}
                </span>
              </li>
            );
          })}
        </ul>
        <div className="divider-gold my-4" />
        <div className="space-y-2 text-sm">
          <div className="flex justify-between text-cream/80"><span>Subtotal</span><span>{formatUSD(order.subtotal)}</span></div>
          <div className="flex justify-between text-cream/80"><span>{settings.taxLabel}</span><span>{formatUSD(order.tax)}</span></div>
          <div className="flex justify-between text-lg font-display font-bold"><span>Total</span><span className="text-gold-300">{formatUSD(order.total)}</span></div>
        </div>
      </div>

      <div className="mt-8 flex justify-center gap-3">
        <Link href="/menu" className="btn-outline-gold">Order again</Link>
        <Link href="/" className="btn-gold">Back home</Link>
      </div>
    </div>
  );
}
