import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { REQUEST_STATUSES, EVENT_TYPE_LABEL, SERVICE_STYLE_LABEL, type EventType, type ServiceStyle } from "@/lib/enums";
import { CateringStatusForm } from "./CateringStatusForm";
import { ArrowLeft, Phone, Mail, Calendar, Users } from "lucide-react";

export const revalidate = 0;

export default async function AdminCateringDetail({ params }: { params: { id: string } }) {
  const r = await prisma.cateringRequest.findUnique({ where: { id: params.id } });
  if (!r) notFound();

  return (
    <div>
      <Link href="/admin/catering" className="text-sm text-gold-300 hover:text-gold-200 inline-flex items-center gap-1 mb-4">
        <ArrowLeft className="w-4 h-4" /> Back to requests
      </Link>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          <div className="card p-6">
            <p className="font-mono text-xs text-gold-500/80">{r.requestNumber}</p>
            <h1 className="font-display text-3xl font-bold mt-1">{r.customerName}</h1>
            <div className="mt-3 grid sm:grid-cols-2 gap-3 text-sm text-cream/80">
              <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-gold-500" />{r.phone}</div>
              <div className="flex items-center gap-2"><Mail className="w-4 h-4 text-gold-500" />{r.email}</div>
              <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-gold-500" />
                {new Date(r.eventDate).toLocaleDateString()} {r.eventTime}
              </div>
              <div className="flex items-center gap-2"><Users className="w-4 h-4 text-gold-500" />{r.guestCount} guests</div>
            </div>
          </div>

          <div className="card p-6 space-y-3 text-sm">
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <p className="text-gold-300 text-xs uppercase tracking-widest mb-1">Event type</p>
                <p>{EVENT_TYPE_LABEL[r.eventType as EventType]}</p>
              </div>
              <div>
                <p className="text-gold-300 text-xs uppercase tracking-widest mb-1">Service style</p>
                <p>{SERVICE_STYLE_LABEL[r.serviceStyle as ServiceStyle]}</p>
              </div>
              {r.budgetRange && (
                <div>
                  <p className="text-gold-300 text-xs uppercase tracking-widest mb-1">Budget</p>
                  <p>{r.budgetRange}</p>
                </div>
              )}
              <div>
                <p className="text-gold-300 text-xs uppercase tracking-widest mb-1">Submitted</p>
                <p>{new Date(r.createdAt).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}</p>
              </div>
            </div>
            {r.menuRequests && (
              <div>
                <p className="text-gold-300 text-xs uppercase tracking-widest mt-2 mb-1">Menu requests / dietary</p>
                <p className="whitespace-pre-wrap text-cream/85">{r.menuRequests}</p>
              </div>
            )}
          </div>
        </div>

        <aside className="space-y-5">
          <div className="card p-6">
            <h2 className="font-display text-xl font-bold text-gold-200 mb-3">Manage</h2>
            <CateringStatusForm
              id={r.id}
              status={r.status}
              adminNotes={r.adminNotes ?? ""}
              quotedAmount={r.quotedAmount ?? null}
              statuses={[...REQUEST_STATUSES]}
            />
          </div>
        </aside>
      </div>
    </div>
  );
}
