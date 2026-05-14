"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/components/Toaster";
import { Plus, Trash2, Star, Save, Eye, EyeOff } from "lucide-react";

type T = {
  id: string;
  name: string;
  role: string;
  rating: number;
  text: string;
  textVn?: string;
  isActive: boolean;
  displayOrder: number;
};

export function TestimonialsAdmin({ initial }: { initial: T[] }) {
  const router = useRouter();
  const [items, setItems] = useState<T[]>(initial);
  const [editing, setEditing] = useState<Partial<T> | null>(null);
  const [loading, setLoading] = useState(false);

  function startNew() {
    setEditing({ name: "", role: "", rating: 5, text: "", textVn: "", isActive: true, displayOrder: items.length });
  }

  async function save() {
    if (!editing?.name || !editing?.text) {
      toast("Name and review text are required", "error");
      return;
    }
    setLoading(true);
    const isUpdate = !!editing.id;
    const url = isUpdate ? `/api/admin/testimonials/${editing.id}` : "/api/admin/testimonials";
    const method = isUpdate ? "PATCH" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editing),
    });
    setLoading(false);
    if (!res.ok) {
      toast("Save failed", "error");
      return;
    }
    const data = await res.json();
    if (isUpdate) {
      setItems(items.map((i) => (i.id === editing.id ? { ...i, ...editing, ...data.testimonial } : i)));
    } else {
      setItems([...items, data.testimonial]);
    }
    setEditing(null);
    toast("Saved", "success");
    router.refresh();
  }

  async function remove(id: string) {
    if (!confirm("Delete this testimonial?")) return;
    const res = await fetch(`/api/admin/testimonials/${id}`, { method: "DELETE" });
    if (!res.ok) {
      toast("Delete failed", "error");
      return;
    }
    setItems(items.filter((i) => i.id !== id));
    toast("Deleted", "success");
    router.refresh();
  }

  async function toggleActive(t: T) {
    const next = !t.isActive;
    const res = await fetch(`/api/admin/testimonials/${t.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: next }),
    });
    if (!res.ok) {
      toast("Toggle failed", "error");
      return;
    }
    setItems(items.map((i) => (i.id === t.id ? { ...i, isActive: next } : i)));
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-cream/65">
          Customer reviews shown on the home page. Toggle visibility with the eye icon.
        </p>
        <button onClick={startNew} className="btn-gold !px-4 !py-2 text-sm">
          <Plus className="w-4 h-4" /> New testimonial
        </button>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {items.length === 0 && (
          <div className="card p-8 text-center text-cream/60 sm:col-span-2">
            No testimonials yet. Click <strong>New testimonial</strong> to add one.
          </div>
        )}
        {items.map((t) => (
          <div key={t.id} className="card p-5 relative">
            <div className="absolute top-3 right-3 flex gap-1">
              <button
                onClick={() => toggleActive(t)}
                className={`p-1.5 rounded-md ${t.isActive ? "text-green-400 hover:bg-green-500/15" : "text-cream/40 hover:bg-cream/10"}`}
                title={t.isActive ? "Visible" : "Hidden"}
              >
                {t.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setEditing(t)}
                className="p-1.5 rounded-md text-gold-300 hover:bg-gold-500/15"
                title="Edit"
              >
                <Save className="w-4 h-4" />
              </button>
              <button
                onClick={() => remove(t.id)}
                className="p-1.5 rounded-md text-red-300 hover:bg-red-500/15"
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <div className="flex gap-0.5 mb-2">
              {Array.from({ length: Math.max(1, Math.min(5, t.rating)) }).map((_, idx) => (
                <Star key={idx} className="w-3.5 h-3.5 fill-gold-400 stroke-gold-400" />
              ))}
            </div>
            <p className="text-sm text-cream/85 line-clamp-4">{t.text}</p>
            <div className="divider-gold my-3" />
            <p className="text-sm font-semibold text-gold-200">{t.name}</p>
            <p className="text-xs text-cream/55">{t.role}</p>
          </div>
        ))}
      </div>

      {editing !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setEditing(null)}
        >
          <div
            className="card w-full max-w-lg p-6 border-gold-500/40 shadow-gold-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-display text-xl font-bold text-gold-200 mb-4">
              {editing.id ? "Edit testimonial" : "New testimonial"}
            </h3>
            <div className="space-y-3">
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="label-dark">Name *</label>
                  <input
                    className="input-dark"
                    value={editing.name ?? ""}
                    onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                    placeholder="Linh T."
                  />
                </div>
                <div>
                  <label className="label-dark">Role / event</label>
                  <input
                    className="input-dark"
                    value={editing.role ?? ""}
                    onChange={(e) => setEditing({ ...editing, role: e.target.value })}
                    placeholder="Wedding · 250 guests"
                  />
                </div>
              </div>
              <div>
                <label className="label-dark">Rating</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setEditing({ ...editing, rating: n })}
                      className={`p-1 ${(editing.rating ?? 5) >= n ? "text-gold-400" : "text-cream/30"}`}
                    >
                      <Star className={`w-6 h-6 ${(editing.rating ?? 5) >= n ? "fill-gold-400" : ""}`} />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="label-dark">Review (EN) *</label>
                <textarea
                  rows={4}
                  className="input-dark"
                  value={editing.text ?? ""}
                  onChange={(e) => setEditing({ ...editing, text: e.target.value })}
                  placeholder="The food was amazing…"
                />
              </div>
              <div>
                <label className="label-dark">Review (VN, optional)</label>
                <textarea
                  rows={4}
                  className="input-dark"
                  value={editing.textVn ?? ""}
                  onChange={(e) => setEditing({ ...editing, textVn: e.target.value })}
                  placeholder="Món ăn tuyệt vời…"
                />
                <p className="text-[10px] text-cream/50 mt-1">If blank, English text shows for both languages.</p>
              </div>
              <div>
                <label className="label-dark">Display order</label>
                <input
                  type="number"
                  className="input-dark"
                  value={editing.displayOrder ?? 0}
                  onChange={(e) => setEditing({ ...editing, displayOrder: parseInt(e.target.value || "0") })}
                />
              </div>
            </div>
            <div className="mt-5 flex gap-2 justify-end">
              <button onClick={() => setEditing(null)} className="btn-outline-gold !px-4 !py-2 text-sm">
                Cancel
              </button>
              <button onClick={save} disabled={loading} className="btn-gold !px-4 !py-2 text-sm disabled:opacity-60">
                <Save className="w-4 h-4" /> {loading ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
