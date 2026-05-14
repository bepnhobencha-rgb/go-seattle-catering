"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { REQUEST_STATUS_LABEL, type RequestStatus } from "@/lib/enums";
import { toast } from "@/components/Toaster";

export function CateringStatusForm({
  id,
  status: initStatus,
  adminNotes: initNotes,
  quotedAmount: initAmount,
  statuses,
}: {
  id: string;
  status: string;
  adminNotes: string;
  quotedAmount: number | null;
  statuses: string[];
}) {
  const router = useRouter();
  const [status, setStatus] = useState(initStatus);
  const [adminNotes, setNotes] = useState(initNotes);
  const [quoted, setQuoted] = useState<string>(initAmount?.toString() ?? "");
  const [loading, setLoading] = useState(false);

  async function save() {
    setLoading(true);
    const res = await fetch(`/api/admin/catering/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status,
        adminNotes: adminNotes.trim() || null,
        quotedAmount: quoted ? parseFloat(quoted) : null,
      }),
    });
    setLoading(false);
    if (!res.ok) {
      toast("Update failed", "error");
      return;
    }
    toast("Saved", "success");
    router.refresh();
  }

  return (
    <div className="space-y-3">
      <div>
        <label className="label-dark">Status</label>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="input-dark">
          {statuses.map((s) => (
            <option key={s} value={s} className="bg-ink-800">
              {REQUEST_STATUS_LABEL[s as RequestStatus]}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="label-dark">Quoted amount (USD)</label>
        <input
          type="number"
          step="0.01"
          value={quoted}
          onChange={(e) => setQuoted(e.target.value)}
          className="input-dark"
          placeholder="e.g. 2500"
        />
      </div>
      <div>
        <label className="label-dark">Admin notes</label>
        <textarea
          value={adminNotes}
          onChange={(e) => setNotes(e.target.value)}
          rows={4}
          className="input-dark"
          placeholder="Internal notes…"
        />
      </div>
      <button onClick={save} disabled={loading} className="btn-gold w-full disabled:opacity-50">
        {loading ? "Saving…" : "Save changes"}
      </button>
    </div>
  );
}
