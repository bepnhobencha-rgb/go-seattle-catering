import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { formatUSD } from "@/lib/utils";
import {
  ORDER_STATUS_COLOR,
  REQUEST_STATUS_COLOR,
  orderStatusLabel,
  requestStatusLabel,
  eventTypeLabel,
} from "@/lib/enums";
import type { OrderStatus, RequestStatus, EventType } from "@/lib/enums";
import { LogoutButton } from "./LogoutButton";
import { LayoutDashboard } from "lucide-react";
import { dict } from "@/lib/i18n";
import { getLang } from "@/lib/i18n-server";

export default async function AccountPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/auth/login?callbackUrl=/account");

  const lang = await getLang();
  const t = dict[lang];

  const [orders, requests] = await Promise.all([
    prisma.order.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      include: { items: true },
      take: 20,
    }),
    prisma.cateringRequest.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
  ]);

  const isAdmin = session.user.role === "ADMIN";
  const locale = lang === "vn" ? "vi-VN" : "en-US";

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-8">
        <div>
          <h1 className="font-display text-4xl font-bold">
            {t.accountHi} <span className="text-gold-gradient">{session.user.name}</span>
          </h1>
          <p className="text-cream/65 text-sm mt-1">{session.user.email}</p>
        </div>
        <div className="flex gap-2">
          {isAdmin && (
            <Link href="/admin" className="btn-outline-gold">
              <LayoutDashboard className="w-4 h-4" /> {t.accountAdmin}
            </Link>
          )}
          <LogoutButton label={t.accountSignOut} />
        </div>
      </div>

      <section className="mt-6">
        <h2 className="font-display text-2xl font-bold text-gold-200 mb-4">{t.accountYourOrders}</h2>
        {orders.length === 0 ? (
          <div className="card p-6 text-center text-cream/60">
            {t.accountNoOrders}{" "}
            <Link href="/menu" className="text-gold-300 hover:underline">
              {t.accountBrowseMenuLink}
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((o) => (
              <Link
                key={o.id}
                href={`/order/${o.orderNumber}`}
                className="card p-5 hover:border-gold-500/60 transition-colors flex items-center justify-between gap-3"
              >
                <div>
                  <p className="font-mono text-xs text-gold-500/80">{o.orderNumber}</p>
                  <p className="font-display font-bold text-lg mt-1">{o.items.length} {t.accountItems}</p>
                  <p className="text-xs text-cream/60 mt-1">
                    {t.accountPickup} {new Date(o.pickupAt).toLocaleString(locale, { dateStyle: "medium", timeStyle: "short" })}
                  </p>
                </div>
                <div className="text-right">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${ORDER_STATUS_COLOR[o.status as OrderStatus]}`}>
                    {orderStatusLabel(o.status as OrderStatus, lang)}
                  </span>
                  <p className="text-gold-300 font-display font-bold mt-2">{formatUSD(o.total)}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="mt-12">
        <h2 className="font-display text-2xl font-bold text-gold-200 mb-4">{t.accountCateringRequests}</h2>
        {requests.length === 0 ? (
          <div className="card p-6 text-center text-cream/60">
            {t.accountNoRequests}{" "}
            <Link href="/catering" className="text-gold-300 hover:underline">
              {t.accountRequestQuoteLink}
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {requests.map((r) => (
              <div key={r.id} className="card p-5 flex items-center justify-between gap-3">
                <div>
                  <p className="font-mono text-xs text-gold-500/80">{r.requestNumber}</p>
                  <p className="font-display font-bold text-lg mt-1">
                    {eventTypeLabel(r.eventType as EventType, lang)} · {r.guestCount} {t.heroGuestsLabel}
                  </p>
                  <p className="text-xs text-cream/60 mt-1">
                    {t.accountEvent} {new Date(r.eventDate).toLocaleDateString(locale)} {r.eventTime}
                  </p>
                </div>
                <div className="text-right">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${REQUEST_STATUS_COLOR[r.status as RequestStatus]}`}>
                    {requestStatusLabel(r.status as RequestStatus, lang)}
                  </span>
                  {r.quotedAmount && (
                    <p className="text-gold-300 font-display font-bold mt-2">{formatUSD(r.quotedAmount)}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
