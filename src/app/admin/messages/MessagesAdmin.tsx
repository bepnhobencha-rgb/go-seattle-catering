"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/components/Toaster";
import { Mail, Phone, Trash2, CheckCircle, CircleDot } from "lucide-react";

type Msg = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  isRead: boolean;
  createdAt: Date | string;
};

export function MessagesAdmin({ initial }: { initial: Msg[] }) {
  const router = useRouter();
  const [items, setItems] = useState<Msg[]>(initial);

  async function patch(id: string, body: Record<string, unknown>) {
    const res = await fetch(`/api/admin/messages/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      toast("Update failed", "error");
      return false;
    }
    return true;
  }

  async function toggleRead(m: Msg) {
    const next = !m.isRead;
    if (await patch(m.id, { isRead: next })) {
      setItems(items.map((x) => (x.id === m.id ? { ...x, isRead: next } : x)));
      router.refresh();
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this message?")) return;
    const res = await fetch(`/api/admin/messages/${id}`, { method: "DELETE" });
    if (!res.ok) {
      toast("Delete failed", "error");
      return;
    }
    setItems(items.filter((x) => x.id !== id));
    toast("Deleted", "success");
    router.refresh();
  }

  const unread = items.filter((m) => !m.isRead).length;

  return (
    <div>
      <p className="text-sm text-cream/65 mb-6">
        Customer messages from the Contact page. {unread > 0 && (
          <span className="text-gold-300 font-semibold">{unread} unread.</span>
        )}
      </p>

      {items.length === 0 ? (
        <div className="card p-10 text-center text-cream/60">No messages yet.</div>
      ) : (
        <div className="space-y-3">
          {items.map((m) => (
            <div
              key={m.id}
              className={`card p-5 ${
                m.isRead ? "opacity-70" : "border-gold-500/50 shadow-gold"
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <button
                    onClick={() => toggleRead(m)}
                    className="mt-1 shrink-0"
                    title={m.isRead ? "Mark unread" : "Mark read"}
                  >
                    {m.isRead ? (
                      <CheckCircle className="w-4 h-4 text-green-400" />
                    ) : (
                      <CircleDot className="w-4 h-4 text-gold-400" />
                    )}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className="font-display font-bold text-cream">{m.name}</p>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-cream/65 mt-1">
                      <a href={`mailto:${m.email}`} className="flex items-center gap-1 hover:text-gold-300">
                        <Mail className="w-3 h-3" /> {m.email}
                      </a>
                      {m.phone && (
                        <a href={`tel:${m.phone}`} className="flex items-center gap-1 hover:text-gold-300">
                          <Phone className="w-3 h-3" /> {m.phone}
                        </a>
                      )}
                      <span className="text-cream/45">
                        {new Date(m.createdAt).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => remove(m.id)}
                  className="p-1.5 rounded-md text-red-300 hover:bg-red-500/15"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="bg-ink-950/60 p-3 rounded-md text-sm text-cream/85 whitespace-pre-wrap">
                {m.message}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
