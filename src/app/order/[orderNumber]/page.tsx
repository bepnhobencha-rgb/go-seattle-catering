import { prisma } from "@/lib/prisma";
import { formatUSD } from "@/lib/utils";
import { ORDER_STATUS_LABEL, ORDER_STATUS_COLOR, type OrderStatus } from "@/lib/enums";
import { CheckCircle2, Clock, MapPin, CreditCard, Banknote } from "lucide-react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { maintenanceGate } from "@/lib/maintenance";
import { dict } from "@/lib/i18n";
import { getLang } from "@/lib/i18n-server";

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

  // Payment status is the source of truth from DB (updated by Stripe webhook).
  // We DO NOT trust the ?paid=1 URL param — a customer could forge that to
  // mark an order paid without actually paying. We only show a friendly
  // "verifying payment" hint if they just came back from Stripe.
  const paymentStatus = order.paymentStatus;
  const justReturnedFromStripe = searchParams.paid === "1" && order.paymentMethod === "STRIPE";

  const status = order.status as OrderStatus;
  const settings = await maintenanceGate();
  const lang = await getLang();
  const t = dict[lang];
  const isStripe = order.paymentMethod === "STRIPE";
  const isPaid = paymentStatus === "PAID";

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto rounded-full bg-gold-gradient flex items-center justify-center text-ink-900">
          <CheckCircle2 className="w-9 h-9" />
        </div>
        <h1 className="font-display text-4xl font-bold mt-4">
          {t.orderConfirmed} <span className="text-gold-gradient">{t.orderConfirmedAccent}</span>
        </h1>
        <p className="text-cream/70 mt-2">{t.orderThankYou} {order.customerName}!</p>
        <p className="text-sm text-cream/60 mt-1">
          {t.orderNumber} <span className="font-mono text-gold-300">{order.orderNumber}</span>
        </p>
      </div>

      <div className="card p-6 mt-8 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-gold-200 font-semibold">{t.orderStatus}</span>
          <span className={`px-3 py-1 rounded-full text-xs font-bold border ${ORDER_STATUS_COLOR[status]}`}>
            {ORDER_STATUS_LABEL[status]}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gold-200 font-semibold flex items-center gap-2">
            {isStripe ? <CreditCard className="w-4 h-4" /> : <Banknote className="w-4 h-4" />}
            {t.orderPayment}
          </span>
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold border ${
              isPaid
                ? "bg-green-500/15 text-green-300 border-green-500/40"
                : "bg-yellow-500/15 text-yellow-300 border-yellow-500/40"
            }`}
          >
            {isStripe
              ? isPaid
                ? t.orderPaidOnline
                : justReturnedFromStripe
                ? (lang === "vn" ? "Đang xác minh thanh toán…" : "Verifying payment…")
                : t.orderAwaitingPayment
              : t.orderPayAtPickupLabel}
          </span>
        </div>
        <div className="flex items-center gap-2 text-cream/85 text-sm">
          <Clock className="w-4 h-4 text-gold-400" />
          {t.orderPickup} {new Date(order.pickupAt).toLocaleString(lang === "vn" ? "vi-VN" : "en-US", { dateStyle: "medium", timeStyle: "short" })}
        </div>
        <div className="flex items-center gap-2 text-cream/85 text-sm">
          <MapPin className="w-4 h-4 text-gold-400" />
          {settings.address}{settings.address && settings.phone ? " · " : ""}{settings.phone}
        </div>
      </div>

      <div className="card p-6 mt-5">
        <h2 className="font-display text-xl font-bold text-gold-200 mb-3">{t.orderItems}</h2>
        <ul className="divide-y divide-gold-900/40 text-sm">
          {order.items.map((it) => {
            const toppings = it.toppings ? (JSON.parse(it.toppings) as { name: string; price: number }[]) : [];
            const itemName = lang === "vn" && it.menuItem.nameVn ? it.menuItem.nameVn : it.menuItem.nameEn;
            return (
              <li key={it.id} className="py-3 flex justify-between gap-3">
                <div>
                  <p className="text-cream">{it.quantity}× {itemName}</p>
                  {toppings.length > 0 && (
                    <p className="text-xs text-gold-300/70">+ {toppings.map((top) => top.name).join(", ")}</p>
                  )}
                  {it.notes && <p className="text-xs text-cream/55 italic">{t.orderNote} {it.notes}</p>}
                </div>
                <span className="text-cream shrink-0">
                  {formatUSD((it.unitPrice + toppings.reduce((s, top) => s + top.price, 0)) * it.quantity)}
                </span>
              </li>
            );
          })}
        </ul>
        <div className="divider-gold my-4" />
        <div className="space-y-2 text-sm">
          <div className="flex justify-between text-cream/80"><span>{t.cartSubtotal}</span><span>{formatUSD(order.subtotal)}</span></div>
          <div className="flex justify-between text-cream/80"><span>{settings.taxLabel}</span><span>{formatUSD(order.tax)}</span></div>
          <div className="flex justify-between text-lg font-display font-bold"><span>{t.cartTotal}</span><span className="text-gold-300">{formatUSD(order.total)}</span></div>
        </div>
      </div>

      <div className="mt-8 flex justify-center gap-3">
        <Link href="/menu" className="btn-outline-gold">{t.orderAgain}</Link>
        <Link href="/" className="btn-gold">{t.backHome}</Link>
      </div>
    </div>
  );
}
