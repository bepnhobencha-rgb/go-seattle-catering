import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { formatUSD } from "@/lib/utils";
import { ORDER_STATUS_LABEL, ORDER_STATUS_COLOR, REQUEST_STATUS_LABEL, REQUEST_STATUS_COLOR } from "@/lib/enums";
import type { OrderStatus, RequestStatus } from "@/lib/enums";
import { LogoutButton } from "./LogoutButton";
import { LayoutDashboard } from "lucide-react";

export default async function AccountPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/auth/login?callbackUrl=/account");

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

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-8">
        <div>
          <h1 className="font-display text-4xl font-bold">
            Hi, <span className="text-gold-gradient">{session.user.name}</span>
          </h1>
          <p className="text-cream/65 text-sm mt-1">{session.user.email}</p>
        </div>
        <div className="flex gap-2">
          {isAdmin && (
            <Link href="/admin" className="btn-outline-gold">
              <LayoutDashboard className="w-4 h-4" /> Admin
            </Link>
          )}
          <LogoutButton />
        </div>
      </div>

      <section className="mt-6">
        <h2 className="font-display text-2xl font-bold text-gold-200 mb-4">Your orders</h2>
        {orders.length === 0 ? (
          <div className="card p-6 text-center text-cream/60">
            No orders yet. <Link href="/menu" className="text-gold-300 hover:underline">Browse the menu</Link>
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
                  <p className="font-display font-bold text-lg mt-1">{o.items.length} item{o.items.length > 1 ? "s" : ""}</p>
                  <p className="text-xs text-cream/60 mt-1">
                    Pickup {new Date(o.pickupAt).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}
                  </p>
                </div>
                <div className="text-right">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${ORDER_STATUS_COLOR[o.status as OrderStatus]}`}>
                    {ORDER_STATUS_LABEL[o.status as OrderStatus]}
                  </span>
                  <p className="text-gold-300 font-display font-bold mt-2">{formatUSD(o.total)}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="mt-12">
        <h2 className="font-display text-2xl font-bold text-gold-200 mb-4">Catering requests</h2>
        {requests.length === 0 ? (
          <div className="card p-6 text-center text-cream/60">
            No catering requests. <Link href="/catering" className="text-gold-300 hover:underline">Request a quote</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {requests.map((r) => (
              <div key={r.id} className="card p-5 flex items-center justify-between gap-3">
                <div>
                  <p className="font-mono text-xs text-gold-500/80">{r.requestNumber}</p>
                  <p className="font-display font-bold text-lg mt-1">
                    {r.eventType.replace("_", " ")} · {r.guestCount} guests
                  </p>
                  <p className="text-xs text-cream/60 mt-1">
                    Event {new Date(r.eventDate).toLocaleDateString()} {r.eventTime}
                  </p>
                </div>
                <div className="text-right">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${REQUEST_STATUS_COLOR[r.status as RequestStatus]}`}>
                    {REQUEST_STATUS_LABEL[r.status as RequestStatus]}
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
