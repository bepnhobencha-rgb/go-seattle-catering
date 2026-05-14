import { prisma } from "@/lib/prisma";
import { formatUSD } from "@/lib/utils";
import { ShoppingBag, CalendarCheck, DollarSign, Clock } from "lucide-react";
import Link from "next/link";

export const revalidate = 0;

export default async function AdminOverview() {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const [
    pendingOrders,
    newRequests,
    totalThisWeek,
    recentOrders,
    recentRequests,
  ] = await Promise.all([
    prisma.order.count({ where: { status: { in: ["PENDING", "CONFIRMED", "PREPARING"] } } }),
    prisma.cateringRequest.count({ where: { status: "NEW" } }),
    prisma.order.aggregate({
      _sum: { total: true },
      where: { createdAt: { gte: sevenDaysAgo }, status: { not: "CANCELLED" } },
    }),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.cateringRequest.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  const stats = [
    { label: "Pending orders", value: pendingOrders.toString(), icon: Clock, href: "/admin/orders" },
    { label: "New catering requests", value: newRequests.toString(), icon: CalendarCheck, href: "/admin/catering" },
    { label: "Revenue (7d)", value: formatUSD(totalThisWeek._sum.total ?? 0), icon: DollarSign },
    { label: "Manage menu", value: "→", icon: ShoppingBag, href: "/admin/menu" },
  ];

  return (
    <div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => {
          const inner = (
            <div className="card p-5 hover:border-gold-500/60 transition-colors h-full">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-widest text-gold-400 font-semibold">{s.label}</span>
                <s.icon className="w-5 h-5 text-gold-500" />
              </div>
              <p className="text-3xl font-display font-bold mt-3">{s.value}</p>
            </div>
          );
          return s.href ? (
            <Link key={s.label} href={s.href}>{inner}</Link>
          ) : (
            <div key={s.label}>{inner}</div>
          );
        })}
      </div>

      <div className="mt-10 grid lg:grid-cols-2 gap-6">
        <div>
          <h2 className="font-display text-xl font-bold text-gold-200 mb-3">Recent orders</h2>
          <div className="space-y-2">
            {recentOrders.length === 0 && <div className="card p-5 text-cream/60 text-sm">No orders yet</div>}
            {recentOrders.map((o) => (
              <Link key={o.id} href={`/admin/orders/${o.id}`} className="card p-4 flex justify-between items-center hover:border-gold-500/60">
                <div>
                  <p className="font-mono text-xs text-gold-500/80">{o.orderNumber}</p>
                  <p className="text-sm font-semibold">{o.customerName}</p>
                </div>
                <span className="text-gold-300 font-display font-bold">{formatUSD(o.total)}</span>
              </Link>
            ))}
          </div>
        </div>
        <div>
          <h2 className="font-display text-xl font-bold text-gold-200 mb-3">Recent catering requests</h2>
          <div className="space-y-2">
            {recentRequests.length === 0 && <div className="card p-5 text-cream/60 text-sm">No requests yet</div>}
            {recentRequests.map((r) => (
              <Link key={r.id} href={`/admin/catering/${r.id}`} className="card p-4 flex justify-between items-center hover:border-gold-500/60">
                <div>
                  <p className="font-mono text-xs text-gold-500/80">{r.requestNumber}</p>
                  <p className="text-sm font-semibold">{r.customerName} · {r.guestCount} guests</p>
                </div>
                <span className="text-xs text-cream/60">
                  {new Date(r.eventDate).toLocaleDateString()}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
