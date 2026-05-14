import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { formatUSD } from "@/lib/utils";
import { ORDER_STATUSES } from "@/lib/enums";
import { OrderStatusForm } from "./OrderStatusForm";
import Link from "next/link";
import { ArrowLeft, Phone, Mail, Clock } from "lucide-react";

export const revalidate = 0;

export default async function AdminOrderDetail({ params }: { params: { id: string } }) {
  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: { items: { include: { menuItem: true } } },
  });
  if (!order) notFound();

  return (
    <div>
      <Link href="/admin/orders" className="text-sm text-gold-300 hover:text-gold-200 inline-flex items-center gap-1 mb-4">
        <ArrowLeft className="w-4 h-4" /> Back to orders
      </Link>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          <div className="card p-6">
            <p className="font-mono text-xs text-gold-500/80">{order.orderNumber}</p>
            <h1 className="font-display text-3xl font-bold mt-1">{order.customerName}</h1>
            <div className="mt-3 grid sm:grid-cols-2 gap-3 text-sm text-cream/80">
              <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-gold-500" /> {order.phone}</div>
              <div className="flex items-center gap-2"><Mail className="w-4 h-4 text-gold-500" /> {order.email}</div>
              <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-gold-500" />
                Pickup {new Date(order.pickupAt).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}
              </div>
              <div className="text-cream/55">
                Placed {new Date(order.createdAt).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}
              </div>
            </div>
            {order.notes && (
              <div className="mt-3 p-3 rounded-md bg-ink-950/60 border border-gold-900/40 text-sm">
                <span className="text-gold-300 font-semibold">Notes: </span>{order.notes}
              </div>
            )}
          </div>

          <div className="card p-6">
            <h2 className="font-display text-xl font-bold text-gold-200 mb-3">Items</h2>
            <ul className="divide-y divide-gold-900/40 text-sm">
              {order.items.map((it) => {
                const toppings = it.toppings ? (JSON.parse(it.toppings) as { name: string; price: number }[]) : [];
                return (
                  <li key={it.id} className="py-3 flex justify-between gap-3">
                    <div>
                      <p className="text-cream font-semibold">{it.quantity}× {it.menuItem.nameEn}</p>
                      <p className="text-xs text-gold-300/70">{it.menuItem.code} · {it.menuItem.nameVn}</p>
                      {toppings.length > 0 && (
                        <p className="text-xs text-gold-300/80">+ {toppings.map((t) => t.name).join(", ")}</p>
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
            <div className="text-sm space-y-1.5">
              <div className="flex justify-between text-cream/80"><span>Subtotal</span><span>{formatUSD(order.subtotal)}</span></div>
              <div className="flex justify-between text-cream/80"><span>Tax</span><span>{formatUSD(order.tax)}</span></div>
              <div className="flex justify-between text-lg font-display font-bold"><span>Total</span><span className="text-gold-300">{formatUSD(order.total)}</span></div>
            </div>
          </div>
        </div>

        <aside className="space-y-5">
          <div className="card p-6">
            <h2 className="font-display text-xl font-bold text-gold-200 mb-3">Status</h2>
            <OrderStatusForm orderId={order.id} current={order.status} statuses={[...ORDER_STATUSES]} />
          </div>
        </aside>
      </div>
    </div>
  );
}
