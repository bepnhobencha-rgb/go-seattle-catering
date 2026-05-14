"use client";

import { useCart } from "@/lib/cart-store";
import { formatUSD, calcTax } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { ArrowRight, ShoppingBag, CreditCard, Banknote } from "lucide-react";
import { toast } from "@/components/Toaster";
import { interpolate, type Dict, type Lang } from "@/lib/i18n";

type Props = {
  taxRate: number;
  taxLabel: string;
  minPickupMinutes: number;
  maxPickupDays: number;
  stripeEnabled: boolean;
  t: Dict;
  lang: Lang;
};

export function CheckoutForm({ taxRate, taxLabel, minPickupMinutes, maxPickupDays, stripeEnabled, t, lang }: Props) {
  const router = useRouter();
  const { data: session } = useSession();
  const items = useCart((s) => s.items);
  const subtotal = useCart((s) => s.subtotal());
  const clear = useCart((s) => s.clear);
  const tax = calcTax(subtotal, taxRate);
  const total = subtotal + tax;
  const taxPct = (taxRate * 100).toFixed(2).replace(/\.?0+$/, "");

  const [loading, setLoading] = useState(false);
  const [payMethod, setPayMethod] = useState<"PICKUP" | "STRIPE">(stripeEnabled ? "STRIPE" : "PICKUP");
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    pickupAt: "",
    notes: "",
  });

  useEffect(() => {
    if (session?.user) {
      setForm((f) => ({
        ...f,
        name: f.name || session.user?.name || "",
        email: f.email || session.user?.email || "",
      }));
    }
  }, [session]);

  useEffect(() => {
    // Default pickup: minPickupMinutes from now, rounded to next 15
    const d = new Date(Date.now() + minPickupMinutes * 60 * 1000);
    d.setSeconds(0, 0);
    const m = d.getMinutes();
    d.setMinutes(Math.ceil(m / 15) * 15);
    const iso = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    setForm((f) => ({ ...f, pickupAt: f.pickupAt || iso }));
  }, [minPickupMinutes]);

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center">
        <ShoppingBag className="w-16 h-16 text-gold-500/50 mx-auto" />
        <h1 className="font-display text-3xl mt-4">Nothing to checkout</h1>
        <Link href="/menu" className="btn-gold mt-6">Browse menu</Link>
      </div>
    );
  }

  const minAttr = new Date(Date.now() + minPickupMinutes * 60 * 1000).toISOString().slice(0, 16);
  const maxAttr = new Date(Date.now() + maxPickupDays * 24 * 60 * 60 * 1000).toISOString().slice(0, 16);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          paymentMethod: payMethod,
          items: items.map((i) => ({
            menuItemId: i.menuItemId,
            quantity: i.qty,
            unitPrice: i.unitPrice,
            toppings: i.toppings,
            notes: i.notes,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to place order");

      if (data.checkoutUrl) {
        // Stripe checkout — redirect
        clear();
        window.location.href = data.checkoutUrl;
        return;
      }

      clear();
      toast("Order placed!", "success");
      router.push(`/order/${data.orderNumber}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      toast(msg, "error");
      setLoading(false);
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="font-display text-4xl sm:text-5xl font-bold">
        <span className="text-gold-gradient">{t.checkoutTitle}</span>
      </h1>

      <form onSubmit={onSubmit} className="mt-8 grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-5">
          <div className="card p-6 space-y-4">
            <h2 className="font-display text-xl font-bold text-gold-200">{t.checkoutPickupDetails}</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="label-dark">{t.checkoutFullName} *</label>
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="input-dark"
                />
              </div>
              <div>
                <label className="label-dark">{t.checkoutPhone} *</label>
                <input
                  required
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="input-dark"
                  placeholder="(206) 555-0100"
                />
              </div>
            </div>
            <div>
              <label className="label-dark">{t.checkoutEmail} *</label>
              <input
                required
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="input-dark"
              />
            </div>
            <div>
              <label className="label-dark">{t.checkoutPickupTime} *</label>
              <input
                required
                type="datetime-local"
                value={form.pickupAt}
                onChange={(e) => setForm({ ...form, pickupAt: e.target.value })}
                className="input-dark"
                min={minAttr}
                max={maxAttr}
              />
              <p className="text-xs text-cream/55 mt-1">
                {interpolate(t.checkoutEarliest, { min: minPickupMinutes, days: maxPickupDays })}
              </p>
            </div>
            <div>
              <label className="label-dark">{t.checkoutNotes}</label>
              <textarea
                rows={2}
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                className="input-dark"
              />
            </div>
          </div>

          <div className="card p-6">
            <h2 className="font-display text-xl font-bold text-gold-200 mb-4">{t.checkoutPayment}</h2>
            {stripeEnabled ? (
              <div className="grid sm:grid-cols-2 gap-3">
                <label
                  className={`p-4 rounded-lg border cursor-pointer transition-all ${
                    payMethod === "STRIPE"
                      ? "border-gold-500/60 bg-gold-500/10"
                      : "border-gold-900/50 hover:border-gold-500/40"
                  }`}
                >
                  <input
                    type="radio"
                    name="pay"
                    className="sr-only"
                    checked={payMethod === "STRIPE"}
                    onChange={() => setPayMethod("STRIPE")}
                  />
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-6 h-6 text-gold-400" />
                    <div>
                      <p className="font-semibold text-cream">{t.checkoutCardOnline}</p>
                      <p className="text-xs text-cream/60">{t.checkoutCardOnlineDesc}</p>
                    </div>
                  </div>
                </label>
                <label
                  className={`p-4 rounded-lg border cursor-pointer transition-all ${
                    payMethod === "PICKUP"
                      ? "border-gold-500/60 bg-gold-500/10"
                      : "border-gold-900/50 hover:border-gold-500/40"
                  }`}
                >
                  <input
                    type="radio"
                    name="pay"
                    className="sr-only"
                    checked={payMethod === "PICKUP"}
                    onChange={() => setPayMethod("PICKUP")}
                  />
                  <div className="flex items-center gap-3">
                    <Banknote className="w-6 h-6 text-gold-400" />
                    <div>
                      <p className="font-semibold text-cream">{t.checkoutPayAtPickup}</p>
                      <p className="text-xs text-cream/60">{t.checkoutPayAtPickupDesc}</p>
                    </div>
                  </div>
                </label>
              </div>
            ) : (
              <div className="p-4 rounded-lg bg-gold-500/10 border border-gold-500/30 text-sm text-gold-100">
                {t.checkoutPayInfoOnly}
              </div>
            )}
          </div>
        </div>

        {/* Summary */}
        <aside className="card p-6 h-fit lg:sticky lg:top-24">
          <h2 className="font-display text-xl font-bold text-gold-200">{t.cartOrderSummary}</h2>
          <ul className="mt-3 space-y-2 text-sm max-h-60 overflow-y-auto">
            {items.map((i) => {
              const topT = i.toppings.reduce((s, top) => s + top.price, 0);
              const itemName = lang === "vn" && i.nameVn ? i.nameVn : i.nameEn;
              return (
                <li key={i.id} className="flex justify-between gap-2">
                  <span className="text-cream/80">
                    {i.qty}× {itemName}
                    {i.toppings.length > 0 && (
                      <span className="block text-xs text-gold-300/70">
                        + {i.toppings.map((top) => top.name).join(", ")}
                      </span>
                    )}
                  </span>
                  <span className="text-cream shrink-0">
                    {formatUSD((i.unitPrice + topT) * i.qty)}
                  </span>
                </li>
              );
            })}
          </ul>
          <div className="divider-gold my-4" />
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-cream/80">
              <span>{t.cartSubtotal}</span>
              <span>{formatUSD(subtotal)}</span>
            </div>
            <div className="flex justify-between text-cream/80">
              <span>{taxLabel} ({taxPct}%)</span>
              <span>{formatUSD(tax)}</span>
            </div>
            <div className="flex justify-between text-lg font-display font-bold">
              <span>{t.cartTotal}</span>
              <span className="text-gold-300">{formatUSD(total)}</span>
            </div>
          </div>
          <button disabled={loading} className="btn-gold w-full mt-6 disabled:opacity-60">
            {loading
              ? payMethod === "STRIPE"
                ? t.checkoutRedirecting
                : t.checkoutPlacing
              : payMethod === "STRIPE"
              ? t.checkoutPayWithCard
              : t.checkoutPlaceOrder}{" "}
            <ArrowRight className="w-4 h-4" />
          </button>
          {!session && (
            <p className="mt-3 text-xs text-cream/55 text-center">
              <Link href="/auth/login" className="text-gold-300 hover:underline">{t.checkoutLogin}</Link> {t.checkoutLoginHint}
            </p>
          )}
        </aside>
      </form>
    </div>
  );
}
