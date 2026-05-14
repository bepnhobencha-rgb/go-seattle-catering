"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/components/Toaster";
import { formatUSD } from "@/lib/utils";
import { Plus, Trash2, Save, Eye, EyeOff, ChevronUp, ChevronDown, X, Edit3 } from "lucide-react";

type T = {
  id: string;
  name: string;
  nameVn: string;
  price: number;
  isActive: boolean;
  displayOrder: number;
  categoryIds: string[];
};

type Cat = {
  id: string;
  nameEn: string;
  nameVn: string;
  allowsToppings: boolean;
};

export function ToppingsAdmin({ initial, categories }: { initial: T[]; categories: Cat[] }) {
  const router = useRouter();
  const [items, setItems] = useState<T[]>(initial);
  const [editing, setEditing] = useState<Partial<T> | null>(null);

  function startNew() {
    setEditing({
      name: "",
      nameVn: "",
      price: 0.75,
      isActive: true,
      displayOrder: items.length,
      // Default: assign to every category that already allows toppings.
      categoryIds: categories.filter((c) => c.allowsToppings).map((c) => c.id),
    });
  }

  async function save() {
    if (!editing?.name || editing.price === undefined || editing.price === null) {
      toast("Name and price are required", "error");
      return;
    }
    const isEdit = !!editing.id;
    const res = await fetch(isEdit ? `/api/admin/toppings/${editing.id}` : "/api/admin/toppings", {
      method: isEdit ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: editing.name,
        nameVn: editing.nameVn ?? "",
        price: editing.price,
        isActive: editing.isActive ?? true,
        displayOrder: editing.displayOrder ?? items.length,
        categoryIds: editing.categoryIds ?? [],
      }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      toast(data.error || "Save failed", "error");
      return;
    }
    const data = await res.json();
    if (isEdit) {
      setItems(items.map((x) => (x.id === editing.id ? { ...x, ...data.topping } : x)));
    } else {
      setItems([...items, data.topping].sort((a, b) => a.displayOrder - b.displayOrder));
    }
    setEditing(null);
    toast("Saved", "success");
    router.refresh();
  }

  async function patch(id: string, body: Record<string, unknown>) {
    const res = await fetch(`/api/admin/toppings/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) return false;
    router.refresh();
    return true;
  }

  async function toggleActive(t: T) {
    const next = !t.isActive;
    if (await patch(t.id, { isActive: next })) {
      setItems(items.map((x) => (x.id === t.id ? { ...x, isActive: next } : x)));
    }
  }

  async function reorder(t: T, direction: -1 | 1) {
    const sorted = [...items].sort((a, b) => a.displayOrder - b.displayOrder);
    const idx = sorted.findIndex((x) => x.id === t.id);
    const target = sorted[idx + direction];
    if (!target) return;
    await Promise.all([
      patch(t.id, { displayOrder: target.displayOrder }),
      patch(target.id, { displayOrder: t.displayOrder }),
    ]);
    setItems(
      items.map((x) =>
        x.id === t.id ? { ...x, displayOrder: target.displayOrder } : x.id === target.id ? { ...x, displayOrder: t.displayOrder } : x
      )
    );
  }

  async function remove(t: T) {
    if (!confirm(`Delete topping "${t.name}"?`)) return;
    const res = await fetch(`/api/admin/toppings/${t.id}`, { method: "DELETE" });
    if (!res.ok) {
      toast("Delete failed", "error");
      return;
    }
    setItems(items.filter((x) => x.id !== t.id));
    toast("Deleted", "success");
    router.refresh();
  }

  const sorted = [...items].sort((a, b) => a.displayOrder - b.displayOrder);

  function toggleCategoryAssignment(catId: string) {
    if (!editing) return;
    const cur = editing.categoryIds ?? [];
    const next = cur.includes(catId) ? cur.filter((x) => x !== catId) : [...cur, catId];
    setEditing({ ...editing, categoryIds: next });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="max-w-2xl text-sm text-cream/65">
          Toppings shown to customers ordering items in their assigned categories. A topping with no categories selected is hidden from everyone.
        </div>
        <button onClick={startNew} className="btn-gold !px-4 !py-2 text-sm">
          <Plus className="w-4 h-4" /> New topping
        </button>
      </div>

      <div className="card divide-y divide-gold-900/40">
        {sorted.length === 0 && <div className="p-10 text-center text-cream/60">No toppings yet.</div>}
        {sorted.map((t, i) => {
          const assignedNames = categories
            .filter((c) => t.categoryIds.includes(c.id))
            .map((c) => c.nameEn);
          return (
            <div key={t.id} className="px-4 py-3 flex items-center gap-3">
              <div className="flex flex-col gap-0.5">
                <button onClick={() => reorder(t, -1)} disabled={i === 0} className="text-cream/40 hover:text-gold-300 disabled:opacity-20 disabled:cursor-not-allowed">
                  <ChevronUp className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => reorder(t, 1)} disabled={i === sorted.length - 1} className="text-cream/40 hover:text-gold-300 disabled:opacity-20 disabled:cursor-not-allowed">
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-cream">
                  {t.name}
                  {t.nameVn && <span className="text-gold-300/70 italic font-normal"> · {t.nameVn}</span>}
                </p>
                <p className="text-xs text-cream/55 truncate">
                  {assignedNames.length > 0 ? `→ ${assignedNames.join(", ")}` : <span className="text-yellow-400/70">⚠ Not assigned to any category</span>}
                </p>
              </div>
              <span className="text-gold-300 font-bold w-20 text-right">{formatUSD(t.price)}</span>
              <button onClick={() => toggleActive(t)} className={`p-1.5 rounded-md ${t.isActive ? "text-green-400 hover:bg-green-500/15" : "text-cream/40 hover:bg-cream/10"}`} title={t.isActive ? "Visible" : "Hidden"}>
                {t.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </button>
              <button onClick={() => setEditing(t)} className="p-1.5 rounded-md text-gold-300 hover:bg-gold-500/15" title="Edit">
                <Edit3 className="w-4 h-4" />
              </button>
              <button onClick={() => remove(t)} className="p-1.5 rounded-md text-red-300 hover:bg-red-500/15" title="Delete">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto" onClick={() => setEditing(null)}>
          <div className="card w-full max-w-lg p-6 my-8 border-gold-500/40 shadow-gold-lg space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="font-display text-xl font-bold text-gold-200">
                {editing.id ? "Edit topping" : "New topping"}
              </h3>
              <button onClick={() => setEditing(null)} className="p-1 text-cream/60 hover:text-gold-300">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="label-dark">Name (EN) *</label>
                <input className="input-dark" value={editing.name ?? ""} onChange={(e) => setEditing({ ...editing, name: e.target.value })} placeholder="Tapioca" />
              </div>
              <div>
                <label className="label-dark">Name (VN)</label>
                <input className="input-dark" value={editing.nameVn ?? ""} onChange={(e) => setEditing({ ...editing, nameVn: e.target.value })} placeholder="Trân châu" />
              </div>
            </div>
            <div>
              <label className="label-dark">Price (USD) *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                className="input-dark"
                value={editing.price ?? 0}
                onChange={(e) => setEditing({ ...editing, price: parseFloat(e.target.value || "0") })}
              />
            </div>

            <div>
              <label className="label-dark mb-2">Available in categories</label>
              <p className="text-[10px] text-cream/55 mb-2">
                Pick which menu categories will show this topping. Only categories with &quot;Allows toppings&quot; enabled work — others are greyed out.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-60 overflow-y-auto p-2 rounded-md border border-gold-900/40 bg-ink-950/50">
                {categories.map((c) => {
                  const selected = (editing.categoryIds ?? []).includes(c.id);
                  const enabled = c.allowsToppings;
                  return (
                    <label
                      key={c.id}
                      className={`flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer transition-colors ${
                        selected ? "bg-gold-500/15 border border-gold-500/40" : "border border-transparent hover:bg-gold-500/5"
                      } ${!enabled ? "opacity-50" : ""}`}
                    >
                      <input
                        type="checkbox"
                        checked={selected}
                        onChange={() => toggleCategoryAssignment(c.id)}
                        className="accent-gold-500"
                      />
                      <span className="text-sm text-cream">
                        {c.nameEn} <span className="text-gold-300/60 italic">{c.nameVn}</span>
                        {!enabled && <span className="text-[10px] ml-1 text-yellow-400/70">(needs &quot;Allows toppings&quot;)</span>}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={editing.isActive ?? true}
                onChange={(e) => setEditing({ ...editing, isActive: e.target.checked })}
                className="accent-gold-500"
              />
              <span className="text-sm text-cream/85">Visible to customers</span>
            </label>
            <div className="flex gap-2 justify-end pt-2 border-t border-gold-900/30">
              <button onClick={() => setEditing(null)} className="btn-outline-gold !px-4 !py-2 text-sm">Cancel</button>
              <button onClick={save} className="btn-gold !px-4 !py-2 text-sm">
                <Save className="w-4 h-4" /> {editing.id ? "Save" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
