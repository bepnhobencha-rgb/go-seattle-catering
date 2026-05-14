import { prisma } from "@/lib/prisma";
import { formatUSD } from "@/lib/utils";
import Link from "next/link";
import { ORDER_STATUS_LABEL, ORDER_STATUS_COLOR, type OrderStatus } from "@/lib/enums";

export const revalidate = 0;

export default async function AdminOrders({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  const status = searchParams.status;
  const orders = await prisma.order.findMany({
    where: status ? { status } : undefined,
    orderBy: { createdAt: "desc" },
    include: { items: true },
    take: 100,
  });

  const FILTERS = ["", "PENDING", "CONFIRMED", "PREPARING", "READY", "COMPLETED", "CANCELLED"];

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-6">
        {FILTERS.map((f) => (
          <Link
            key={f || "all"}
            href={f ? `/admin/orders?status=${f}` : "/admin/orders"}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
              (status ?? "") === f
                ? "bg-gold-gradient text-ink-900 border-transparent"
                : "border-gold-900/50 text-cream/75 hover:border-gold-500/40"
            }`}
          >
            {f || "All"}
          </Link>
        ))}
      </div>

      <div className="overflow-x-auto card">
        <table className="w-full text-sm">
          <thead className="text-left text-xs uppercase tracking-widest text-gold-400 border-b border-gold-900/40">
            <tr>
              <th className="px-4 py-3">Order #</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Pickup</th>
              <th className="px-4 py-3">Items</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gold-900/30">
            {orders.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-cream/55">No orders</td></tr>
            )}
            {orders.map((o) => (
              <tr key={o.id} className="hover:bg-gold-500/5">
                <td className="px-4 py-3">
                  <Link href={`/admin/orders/${o.id}`} className="font-mono text-xs text-gold-300 hover:text-gold-200">{o.orderNumber}</Link>
                </td>
                <td className="px-4 py-3">
                  <div className="font-semibold">{o.customerName}</div>
                  <div className="text-xs text-cream/55">{o.phone}</div>
                </td>
                <td className="px-4 py-3 text-cream/80">
                  {new Date(o.pickupAt).toLocaleString("en-US", { dateStyle: "short", timeStyle: "short" })}
                </td>
                <td className="px-4 py-3 text-cream/80">{o.items.length}</td>
                <td className="px-4 py-3 text-gold-300 font-bold">{formatUSD(o.total)}</td>
                <td className="px-4 py-3">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${ORDER_STATUS_COLOR[o.status as OrderStatus]}`}>
                    {ORDER_STATUS_LABEL[o.status as OrderStatus]}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
