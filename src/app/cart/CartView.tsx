"use client";

import { useCart } from "@/lib/cart-store";
import { formatUSD, calcTax } from "@/lib/utils";
import Link from "next/link";
import { Minus, Plus, Trash2, ArrowRight, ShoppingBag } from "lucide-react";
import type { Dict, Lang } from "@/lib/i18n";

export function CartView({
  taxRate,
  taxLabel,
  stripeEnabled,
  t,
  lang,
}: {
  taxRate: number;
  taxLabel: string;
  stripeEnabled: boolean;
  t: Dict;
  lang: Lang;
}) {
  const items = useCart((s) => s.items);
  const updateQty = useCart((s) => s.updateQty);
  const remove = useCart((s) => s.remove);
  const subtotal = useCart((s) => s.subtotal());
  const tax = calcTax(subtotal, taxRate);
  const total = subtotal + tax;
  const taxPct = (taxRate * 100).toFixed(2).replace(/\.?0+$/, "");

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center">
        <ShoppingBag className="w-16 h-16 text-gold-500/50 mx-auto" />
        <h1 className="font-display text-3xl mt-4">{t.cartEmpty}</h1>
        <p className="text-cream/60 mt-2">{t.cartEmptySubtitle}</p>
        <Link href="/menu" className="btn-gold mt-6">{t.browseMenu}</Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="font-display text-4xl sm:text-5xl font-bold">
        {t.cartTitle} <span className="text-gold-gradient">{t.cartTitleAccent}</span>
      </h1>

      <div className="mt-8 grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-3">
          {items.map((line) => {
            const toppingsTotal = line.toppings.reduce((s, t) => s + t.price, 0);
            const linePrice = (line.unitPrice + toppingsTotal) * line.qty;
            return (
              <div key={line.id} className="card p-5 flex gap-4">
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      {line.code && <p className="text-xs text-gold-500/80 font-mono">{line.code}</p>}
                      <h3 className="font-display text-lg font-bold text-cream">
                        {lang === "vn" && line.nameVn ? line.nameVn : line.nameEn}
                      </h3>
                      {(lang === "vn" ? line.nameEn : line.nameVn) && (
                        <p className="text-sm text-gold-300/70 italic">
                          {lang === "vn" ? line.nameEn : line.nameVn}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => remove(line.id)}
                      className="text-cream/50 hover:text-red-400"
                      aria-label={t.cartRemove}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {line.toppings.length > 0 && (
                    <p className="text-xs text-gold-300/80 mt-2">
                      + {line.toppings.map((t) => t.name).join(", ")}
                    </p>
                  )}
                  {line.notes && (
                    <p className="text-xs text-cream/55 italic mt-1">Note: {line.notes}</p>
                  )}

                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQty(line.id, line.qty - 1)}
                        className="w-7 h-7 rounded-full border border-gold-500/60 text-gold-300 hover:bg-gold-500/10 flex items-center justify-center"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-sm font-bold w-6 text-center">{line.qty}</span>
                      <button
                        onClick={() => updateQty(line.id, line.qty + 1)}
                        className="w-7 h-7 rounded-full border border-gold-500/60 text-gold-300 hover:bg-gold-500/10 flex items-center justify-center"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    <span className="text-gold-300 font-display font-bold">{formatUSD(linePrice)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary */}
        <aside className="card p-6 h-fit lg:sticky lg:top-24">
          <h2 className="font-display text-xl font-bold text-gold-200">{t.cartOrderSummary}</h2>
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between text-cream/80">
              <span>{t.cartSubtotal}</span>
              <span>{formatUSD(subtotal)}</span>
            </div>
            <div className="flex justify-between text-cream/80">
              <span>{taxLabel} ({taxPct}%)</span>
              <span>{formatUSD(tax)}</span>
            </div>
            <div className="divider-gold my-3" />
            <div className="flex justify-between text-lg font-display font-bold">
              <span className="text-cream">{t.cartTotal}</span>
              <span className="text-gold-300">{formatUSD(total)}</span>
            </div>
          </div>
          <p className="mt-4 text-xs text-cream/60">
            {stripeEnabled ? t.cartPaymentOnline : t.cartPaymentPickup}
          </p>
          <Link href="/checkout" className="btn-gold w-full mt-5">
            {t.cartCheckout} <ArrowRight className="w-4 h-4" />
          </Link>
          <Link href="/menu" className="block text-center mt-3 text-sm text-gold-300 hover:text-gold-200">
            ← {t.continueShopping}
          </Link>
        </aside>
      </div>
    </div>
  );
}
