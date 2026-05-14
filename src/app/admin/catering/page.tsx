import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { REQUEST_STATUS_LABEL, REQUEST_STATUS_COLOR, EVENT_TYPE_LABEL, type RequestStatus, type EventType } from "@/lib/enums";

export const revalidate = 0;

export default async function AdminCatering({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  const status = searchParams.status;
  const requests = await prisma.cateringRequest.findMany({
    where: status ? { status } : undefined,
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  const FILTERS = ["", "NEW", "CONTACTED", "QUOTED", "BOOKED", "COMPLETED", "DECLINED"];

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-6">
        {FILTERS.map((f) => (
          <Link
            key={f || "all"}
            href={f ? `/admin/catering?status=${f}` : "/admin/catering"}
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
              <th className="px-4 py-3">Ref #</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Event</th>
              <th className="px-4 py-3">Guests</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gold-900/30">
            {requests.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-cream/55">No requests</td></tr>
            )}
            {requests.map((r) => (
              <tr key={r.id} className="hover:bg-gold-500/5">
                <td className="px-4 py-3">
                  <Link href={`/admin/catering/${r.id}`} className="font-mono text-xs text-gold-300 hover:text-gold-200">{r.requestNumber}</Link>
                </td>
                <td className="px-4 py-3">
                  <div className="font-semibold">{r.customerName}</div>
                  <div className="text-xs text-cream/55">{r.email}</div>
                </td>
                <td className="px-4 py-3 text-cream/80">{EVENT_TYPE_LABEL[r.eventType as EventType]}</td>
                <td className="px-4 py-3 text-cream/80">{r.guestCount}</td>
                <td className="px-4 py-3 text-cream/80">
                  {new Date(r.eventDate).toLocaleDateString()} {r.eventTime}
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${REQUEST_STATUS_COLOR[r.status as RequestStatus]}`}>
                    {REQUEST_STATUS_LABEL[r.status as RequestStatus]}
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
