"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ORDER_STATUS_LABEL, type OrderStatus } from "@/lib/enums";
import { toast } from "@/components/Toaster";

export function OrderStatusForm({
  orderId,
  current,
  statuses,
}: {
  orderId: string;
  current: string;
  statuses: string[];
}) {
  const router = useRouter();
  const [status, setStatus] = useState(current);
  const [loading, setLoading] = useState(false);

  async function save() {
    setLoading(true);
    const res = await fetch(`/api/admin/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setLoading(false);
    if (!res.ok) {
      toast("Update failed", "error");
      return;
    }
    toast("Status updated", "success");
    router.refresh();
  }

  return (
    <div className="space-y-3">
      <select value={status} onChange={(e) => setStatus(e.target.value)} className="input-dark">
        {statuses.map((s) => (
          <option key={s} value={s} className="bg-ink-800">
            {ORDER_STATUS_LABEL[s as OrderStatus]}
          </option>
        ))}
      </select>
      <button onClick={save} disabled={loading || status === current} className="btn-gold w-full disabled:opacity-50">
        {loading ? "Saving…" : "Update status"}
      </button>
    </div>
  );
}
