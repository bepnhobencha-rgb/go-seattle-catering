"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { formatUSD } from "@/lib/utils";
import { toast } from "@/components/Toaster";
import {
  Eye, EyeOff, Save, Upload, X, ImageIcon, Loader2, Star, Plus, Trash2,
  ChevronUp, ChevronDown, Layers, Edit3,
} from "lucide-react";

type Item = {
  id: string;
  categoryId: string;
  code: string | null;
  nameEn: string;
  nameVn: string | null;
  description: string | null;
  descriptionVn: string | null;
  basePrice: number;
  image: string | null;
  isActive: boolean;
  isFeatured: boolean;
  displayOrder: number;
};

type Category = {
  id: string;
  slug: string;
  nameEn: string;
  nameVn: string;
  displayOrder: number;
  isActive: boolean;
  items: Item[];
};

export function MenuAdmin({ categories: initialCategories }: { categories: Category[] }) {
  const router = useRouter();
  const [openId, setOpenId] = useState<string | null>(null);
  const [showCategories, setShowCategories] = useState(false);
  const [showNewItem, setShowNewItem] = useState(false);
  const [newItemCategoryId, setNewItemCategoryId] = useState<string>("");
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [showNewCategory, setShowNewCategory] = useState(false);

  function openNewItem(categoryId?: string) {
    setNewItemCategoryId(categoryId || initialCategories[0]?.id || "");
    setShowNewItem(true);
  }

  async function deleteItem(id: string, name: string) {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    const res = await fetch(`/api/admin/menu/${id}`, { method: "DELETE" });
    if (!res.ok) {
      toast("Delete failed", "error");
      return;
    }
    toast("Item deleted", "success");
    router.refresh();
  }

  async function reorderItem(item: Item, direction: -1 | 1) {
    // Find sibling at target position within same category
    const cat = initialCategories.find((c) => c.id === item.categoryId);
    if (!cat) return;
    const sorted = [...cat.items].sort((a, b) => a.displayOrder - b.displayOrder);
    const idx = sorted.findIndex((i) => i.id === item.id);
    const target = sorted[idx + direction];
    if (!target) return;
    // Swap displayOrder
    await Promise.all([
      fetch(`/api/admin/menu/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayOrder: target.displayOrder }),
      }),
      fetch(`/api/admin/menu/${target.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayOrder: item.displayOrder }),
      }),
    ]);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      {/* Top action bar */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <p className="text-sm text-cream/65">
          Manage your menu — add new dishes, edit prices, upload photos, organize by category.
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => setShowCategories((v) => !v)}
            className="btn-outline-gold !px-3 !py-2 text-sm"
          >
            <Layers className="w-4 h-4" /> Categories ({initialCategories.length})
          </button>
          <button onClick={() => openNewItem()} className="btn-gold !px-4 !py-2 text-sm">
            <Plus className="w-4 h-4" /> New item
          </button>
        </div>
      </div>

      {/* Categories management */}
      {showCategories && (
        <CategoriesSection
          categories={initialCategories}
          onEdit={setEditingCategory}
          onNew={() => setShowNewCategory(true)}
        />
      )}

      {/* Items by category */}
      {initialCategories.map((cat) => (
        <section key={cat.id}>
          <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
            <h2 className="font-display text-2xl font-bold text-gold-200">
              {cat.nameEn}{" "}
              <span className="text-gold-400/70 italic text-sm">{cat.nameVn}</span>
              <span className="ml-2 text-xs text-cream/40">({cat.items.length})</span>
            </h2>
            <button
              onClick={() => openNewItem(cat.id)}
              className="text-xs text-gold-300 hover:text-gold-200 inline-flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Add to this category
            </button>
          </div>
          <div className="card divide-y divide-gold-900/40">
            {cat.items
              .sort((a, b) => a.displayOrder - b.displayOrder)
              .map((it, i, arr) => (
                <Row
                  key={it.id}
                  item={it}
                  categories={initialCategories}
                  isFirst={i === 0}
                  isLast={i === arr.length - 1}
                  open={openId === it.id}
                  onToggle={() => setOpenId(openId === it.id ? null : it.id)}
                  onDelete={() => deleteItem(it.id, it.nameEn)}
                  onMoveUp={() => reorderItem(it, -1)}
                  onMoveDown={() => reorderItem(it, 1)}
                />
              ))}
            {cat.items.length === 0 && (
              <div className="px-4 py-8 text-center text-cream/55 text-sm">
                No items yet. <button onClick={() => openNewItem(cat.id)} className="text-gold-300 hover:underline">Add one</button>
              </div>
            )}
          </div>
        </section>
      ))}

      {/* New item modal */}
      {showNewItem && (
        <ItemFormModal
          categories={initialCategories}
          initialCategoryId={newItemCategoryId}
          onClose={() => setShowNewItem(false)}
          onSaved={() => {
            setShowNewItem(false);
            router.refresh();
          }}
        />
      )}

      {/* Category modal */}
      {(showNewCategory || editingCategory) && (
        <CategoryModal
          category={editingCategory ?? undefined}
          onClose={() => {
            setShowNewCategory(false);
            setEditingCategory(null);
          }}
          onSaved={() => {
            setShowNewCategory(false);
            setEditingCategory(null);
            router.refresh();
          }}
        />
      )}
    </div>
  );
}

// ===== Categories =====

function CategoriesSection({
  categories,
  onEdit,
  onNew,
}: {
  categories: Category[];
  onEdit: (c: Category) => void;
  onNew: () => void;
}) {
  const router = useRouter();

  async function reorder(c: Category, direction: -1 | 1) {
    const sorted = [...categories].sort((a, b) => a.displayOrder - b.displayOrder);
    const idx = sorted.findIndex((x) => x.id === c.id);
    const target = sorted[idx + direction];
    if (!target) return;
    await Promise.all([
      fetch(`/api/admin/categories/${c.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayOrder: target.displayOrder }),
      }),
      fetch(`/api/admin/categories/${target.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayOrder: c.displayOrder }),
      }),
    ]);
    router.refresh();
  }

  async function remove(c: Category) {
    if (!confirm(`Delete category "${c.nameEn}"?`)) return;
    const res = await fetch(`/api/admin/categories/${c.id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) {
      toast(data.error || "Delete failed", "error");
      return;
    }
    toast("Category deleted", "success");
    router.refresh();
  }

  async function toggleActive(c: Category) {
    const res = await fetch(`/api/admin/categories/${c.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !c.isActive }),
    });
    if (!res.ok) {
      toast("Update failed", "error");
      return;
    }
    router.refresh();
  }

  const sorted = [...categories].sort((a, b) => a.displayOrder - b.displayOrder);
  return (
    <div className="card p-5 space-y-3 border-gold-500/30">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-lg font-bold text-gold-200">Categories</h3>
        <button onClick={onNew} className="btn-outline-gold !py-1.5 !px-3 text-xs">
          <Plus className="w-3.5 h-3.5" /> New category
        </button>
      </div>
      <div className="divide-y divide-gold-900/40">
        {sorted.map((c, i) => (
          <div key={c.id} className="py-3 flex items-center gap-3">
            <div className="flex flex-col gap-0.5">
              <button
                onClick={() => reorder(c, -1)}
                disabled={i === 0}
                className="text-cream/60 hover:text-gold-300 disabled:opacity-30 disabled:cursor-not-allowed"
                aria-label="Move up"
              >
                <ChevronUp className="w-4 h-4" />
              </button>
              <button
                onClick={() => reorder(c, 1)}
                disabled={i === sorted.length - 1}
                className="text-cream/60 hover:text-gold-300 disabled:opacity-30 disabled:cursor-not-allowed"
                aria-label="Move down"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-cream truncate">
                {c.nameEn} <span className="text-gold-300/70 italic font-normal">· {c.nameVn}</span>
              </p>
              <p className="text-xs text-cream/50 font-mono">
                {c.slug} · {c.items?.length ?? 0} items
              </p>
            </div>
            <button
              onClick={() => toggleActive(c)}
              className={`p-1.5 rounded-md ${c.isActive ? "text-green-400 hover:bg-green-500/15" : "text-cream/40 hover:bg-cream/10"}`}
              title={c.isActive ? "Visible" : "Hidden"}
            >
              {c.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </button>
            <button
              onClick={() => onEdit(c)}
              className="p-1.5 rounded-md text-gold-300 hover:bg-gold-500/15"
              title="Edit"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => remove(c)}
              className="p-1.5 rounded-md text-red-300 hover:bg-red-500/15"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function CategoryModal({
  category,
  onClose,
  onSaved,
}: {
  category?: Category;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    slug: category?.slug ?? "",
    nameEn: category?.nameEn ?? "",
    nameVn: category?.nameVn ?? "",
    isActive: category?.isActive ?? true,
  });
  const [loading, setLoading] = useState(false);
  const isEdit = !!category;

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const url = isEdit ? `/api/admin/categories/${category!.id}` : "/api/admin/categories";
    const method = isEdit ? "PATCH" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      toast(data.error || "Save failed", "error");
      return;
    }
    toast(isEdit ? "Category updated" : "Category created", "success");
    onSaved();
  }

  function slugify(s: string) {
    return s
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <form
        onSubmit={save}
        className="card w-full max-w-lg p-6 border-gold-500/40 shadow-gold-lg space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="font-display text-xl font-bold text-gold-200">
          {isEdit ? "Edit category" : "New category"}
        </h3>
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label className="label-dark">Name (English) *</label>
            <input
              required
              className="input-dark"
              value={form.nameEn}
              onChange={(e) => setForm({ ...form, nameEn: e.target.value, slug: form.slug || slugify(e.target.value) })}
              placeholder="Appetizers"
            />
          </div>
          <div>
            <label className="label-dark">Name (Vietnamese) *</label>
            <input
              required
              className="input-dark"
              value={form.nameVn}
              onChange={(e) => setForm({ ...form, nameVn: e.target.value })}
              placeholder="Khai vị"
            />
          </div>
        </div>
        <div>
          <label className="label-dark">Slug *</label>
          <input
            required
            className="input-dark font-mono text-sm"
            value={form.slug}
            onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase() })}
            placeholder="appetizers"
            pattern="[a-z0-9-]+"
          />
          <p className="text-[10px] text-cream/50 mt-1">Lowercase, dashes only. Used in URLs.</p>
        </div>
        <div className="flex items-center gap-3 pt-2">
          <label className="inline-flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              className="accent-gold-500"
            />
            <span className="text-sm text-cream/85">Visible on menu</span>
          </label>
        </div>
        <div className="flex gap-2 justify-end pt-2">
          <button type="button" onClick={onClose} className="btn-outline-gold !px-4 !py-2 text-sm">
            Cancel
          </button>
          <button disabled={loading} className="btn-gold !px-4 !py-2 text-sm disabled:opacity-60">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}{" "}
            {isEdit ? "Save" : "Create"}
          </button>
        </div>
      </form>
    </div>
  );
}

// ===== Item =====

function Row({
  item,
  categories,
  isFirst,
  isLast,
  open,
  onToggle,
  onDelete,
  onMoveUp,
  onMoveDown,
}: {
  item: Item;
  categories: Category[];
  isFirst: boolean;
  isLast: boolean;
  open: boolean;
  onToggle: () => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}) {
  const router = useRouter();
  const [form, setForm] = useState({
    code: item.code ?? "",
    nameEn: item.nameEn,
    nameVn: item.nameVn ?? "",
    description: item.description ?? "",
    descriptionVn: item.descriptionVn ?? "",
    basePrice: item.basePrice.toString(),
    categoryId: item.categoryId,
    image: item.image,
  });
  const [active, setActive] = useState(item.isActive);
  const [featured, setFeatured] = useState(item.isFeatured);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function patch(payload: Record<string, unknown>) {
    setLoading(true);
    const res = await fetch(`/api/admin/menu/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setLoading(false);
    if (!res.ok) {
      toast("Update failed", "error");
      return false;
    }
    router.refresh();
    return true;
  }

  async function toggleActive() {
    if (await patch({ isActive: !active })) {
      setActive(!active);
      toast(!active ? "Item enabled" : "Item disabled", "success");
    }
  }
  async function toggleFeatured() {
    if (await patch({ isFeatured: !featured })) {
      setFeatured(!featured);
      toast(!featured ? "Pinned to home" : "Removed from home", "success");
    }
  }

  async function save() {
    const p = parseFloat(form.basePrice);
    if (isNaN(p) || p < 0) {
      toast("Invalid price", "error");
      return;
    }
    if (
      await patch({
        code: form.code.trim() || null,
        nameEn: form.nameEn.trim(),
        nameVn: form.nameVn.trim() || null,
        description: form.description.trim() || null,
        descriptionVn: form.descriptionVn.trim() || null,
        basePrice: p,
        categoryId: form.categoryId,
        image: form.image,
      })
    ) {
      toast("Saved", "success");
    }
  }

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast("File too large (max 5 MB)", "error");
      return;
    }
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    try {
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      setForm({ ...form, image: data.url });
      toast("Uploaded — click Save to apply", "success");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Upload failed", "error");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  return (
    <div>
      <div className="px-4 py-3 flex items-center gap-3">
        <div className="flex flex-col gap-0.5">
          <button onClick={onMoveUp} disabled={isFirst} className="text-cream/40 hover:text-gold-300 disabled:opacity-20 disabled:cursor-not-allowed" aria-label="Move up">
            <ChevronUp className="w-3.5 h-3.5" />
          </button>
          <button onClick={onMoveDown} disabled={isLast} className="text-cream/40 hover:text-gold-300 disabled:opacity-20 disabled:cursor-not-allowed" aria-label="Move down">
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="w-12 h-12 rounded-md overflow-hidden bg-ink-950 border border-gold-900/40 shrink-0 relative">
          {item.image ? (
            <Image src={item.image} alt={item.nameEn} fill sizes="48px" className="object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gold-900/60">
              <ImageIcon className="w-5 h-5" />
            </div>
          )}
        </div>
        <div className="flex-1 cursor-pointer min-w-0" onClick={onToggle}>
          <div className="flex items-center gap-2 flex-wrap">
            {item.code && <span className="text-xs font-mono text-gold-500/80">{item.code}</span>}
            <span className="font-semibold text-cream">{item.nameEn}</span>
            {item.nameVn && <span className="text-xs text-gold-300/70 italic">· {item.nameVn}</span>}
          </div>
        </div>
        <span className="text-gold-300 font-bold w-16 text-right">{formatUSD(item.basePrice)}</span>
        <button onClick={toggleFeatured} className={`p-1.5 rounded-md ${featured ? "text-gold-400 hover:bg-gold-500/15" : "text-cream/30 hover:bg-cream/10"}`} title={featured ? "Featured on home" : "Not featured"}>
          <Star className={`w-4 h-4 ${featured ? "fill-gold-400" : ""}`} />
        </button>
        <button onClick={toggleActive} className={`p-1.5 rounded-md ${active ? "text-green-400 hover:bg-green-500/15" : "text-cream/40 hover:bg-cream/10"}`} title={active ? "Visible" : "Hidden"}>
          {active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
        </button>
        <button onClick={onDelete} className="p-1.5 rounded-md text-red-300 hover:bg-red-500/15" title="Delete">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {open && (
        <div className="px-4 pb-5 border-t border-gold-900/30 bg-ink-950/40 space-y-3">
          <div className="grid sm:grid-cols-3 gap-3 pt-3">
            <div>
              <label className="label-dark">Code (e.g. B1)</label>
              <input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} className="input-dark font-mono text-sm" />
            </div>
            <div>
              <label className="label-dark">Price (USD)</label>
              <input type="number" step="0.01" value={form.basePrice} onChange={(e) => setForm({ ...form, basePrice: e.target.value })} className="input-dark" />
            </div>
            <div>
              <label className="label-dark">Category</label>
              <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} className="input-dark">
                {categories.map((c) => (
                  <option key={c.id} value={c.id} className="bg-ink-800">{c.nameEn} · {c.nameVn}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="label-dark">Name (EN) *</label>
              <input required value={form.nameEn} onChange={(e) => setForm({ ...form, nameEn: e.target.value })} className="input-dark" />
            </div>
            <div>
              <label className="label-dark">Name (VN)</label>
              <input value={form.nameVn} onChange={(e) => setForm({ ...form, nameVn: e.target.value })} className="input-dark" />
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="label-dark">Description (EN)</label>
              <textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input-dark" />
            </div>
            <div>
              <label className="label-dark">Description (VN)</label>
              <textarea rows={2} value={form.descriptionVn} onChange={(e) => setForm({ ...form, descriptionVn: e.target.value })} className="input-dark" />
            </div>
          </div>
          <div>
            <label className="label-dark">Image</label>
            <div className="flex gap-3 items-start">
              <div className="w-32 aspect-[4/3] rounded-md overflow-hidden bg-ink-950 border border-gold-900/40 shrink-0 relative">
                {form.image ? (
                  <Image src={form.image} alt="" fill sizes="128px" className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gold-900/60">
                    <ImageIcon className="w-6 h-6" />
                  </div>
                )}
              </div>
              <div className="flex-1 space-y-2">
                <input
                  type="text"
                  value={form.image ?? ""}
                  onChange={(e) => setForm({ ...form, image: e.target.value || null })}
                  className="input-dark text-sm"
                  placeholder="Paste image URL or upload"
                />
                <div className="flex gap-2">
                  <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading} className="btn-outline-gold !py-1.5 !px-3 text-xs disabled:opacity-60">
                    {uploading ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Uploading…</> : <><Upload className="w-3.5 h-3.5" /> Upload</>}
                  </button>
                  {form.image && (
                    <button type="button" onClick={() => setForm({ ...form, image: null })} className="inline-flex items-center gap-1 text-xs text-red-300 hover:text-red-200 px-2">
                      <X className="w-3.5 h-3.5" /> Remove
                    </button>
                  )}
                  <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={onFile} className="hidden" />
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 pt-2">
            <button onClick={save} disabled={loading} className="btn-gold disabled:opacity-60">
              <Save className="w-4 h-4" /> {loading ? "Saving…" : "Save changes"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ===== New item modal =====

function ItemFormModal({
  categories,
  initialCategoryId,
  onClose,
  onSaved,
}: {
  categories: Category[];
  initialCategoryId: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    categoryId: initialCategoryId,
    code: "",
    nameEn: "",
    nameVn: "",
    description: "",
    descriptionVn: "",
    basePrice: "",
    image: null as string | null,
    isActive: true,
    isFeatured: false,
  });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
    const data = await res.json();
    setUploading(false);
    e.target.value = "";
    if (!res.ok) {
      toast(data.error || "Upload failed", "error");
      return;
    }
    setForm({ ...form, image: data.url });
    toast("Uploaded", "success");
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const price = parseFloat(form.basePrice);
    if (isNaN(price) || price < 0) {
      toast("Invalid price", "error");
      return;
    }
    setLoading(true);
    const res = await fetch("/api/admin/menu", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        categoryId: form.categoryId,
        code: form.code.trim() || null,
        nameEn: form.nameEn.trim(),
        nameVn: form.nameVn.trim() || null,
        description: form.description.trim() || null,
        descriptionVn: form.descriptionVn.trim() || null,
        basePrice: price,
        image: form.image,
        isActive: form.isActive,
        isFeatured: form.isFeatured,
      }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      toast(data.error || "Create failed", "error");
      return;
    }
    toast("Menu item created", "success");
    onSaved();
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto" onClick={onClose}>
      <form
        onSubmit={save}
        className="card w-full max-w-2xl p-6 my-8 border-gold-500/40 shadow-gold-lg space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="font-display text-xl font-bold text-gold-200">New menu item</h3>
          <button type="button" onClick={onClose} className="p-2 text-cream/60 hover:text-gold-300">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid sm:grid-cols-3 gap-3">
          <div>
            <label className="label-dark">Code (optional)</label>
            <input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} className="input-dark font-mono text-sm" placeholder="B1" />
          </div>
          <div>
            <label className="label-dark">Price (USD) *</label>
            <input required type="number" step="0.01" min="0" value={form.basePrice} onChange={(e) => setForm({ ...form, basePrice: e.target.value })} className="input-dark" placeholder="8.95" />
          </div>
          <div>
            <label className="label-dark">Category *</label>
            <select required value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} className="input-dark">
              <option value="" className="bg-ink-800">Select…</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id} className="bg-ink-800">{c.nameEn} · {c.nameVn}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label className="label-dark">Name (English) *</label>
            <input required value={form.nameEn} onChange={(e) => setForm({ ...form, nameEn: e.target.value })} className="input-dark" placeholder="Grilled Pork" />
          </div>
          <div>
            <label className="label-dark">Name (Vietnamese)</label>
            <input value={form.nameVn} onChange={(e) => setForm({ ...form, nameVn: e.target.value })} className="input-dark" placeholder="Bánh Mì Thịt Nướng" />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label className="label-dark">Description (English)</label>
            <textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input-dark" />
          </div>
          <div>
            <label className="label-dark">Description (Vietnamese)</label>
            <textarea rows={2} value={form.descriptionVn} onChange={(e) => setForm({ ...form, descriptionVn: e.target.value })} className="input-dark" />
          </div>
        </div>

        <div>
          <label className="label-dark">Image</label>
          <div className="flex gap-3 items-start">
            <div className="w-32 aspect-[4/3] rounded-md overflow-hidden bg-ink-950 border border-gold-900/40 shrink-0 relative">
              {form.image ? (
                <Image src={form.image} alt="" fill sizes="128px" className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gold-900/60">
                  <ImageIcon className="w-6 h-6" />
                </div>
              )}
            </div>
            <div className="flex-1 space-y-2">
              <input
                type="text"
                value={form.image ?? ""}
                onChange={(e) => setForm({ ...form, image: e.target.value || null })}
                className="input-dark text-sm"
                placeholder="Paste URL or upload"
              />
              <div className="flex gap-2">
                <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading} className="btn-outline-gold !py-1.5 !px-3 text-xs disabled:opacity-60">
                  {uploading ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Uploading…</> : <><Upload className="w-3.5 h-3.5" /> Upload</>}
                </button>
                {form.image && (
                  <button type="button" onClick={() => setForm({ ...form, image: null })} className="inline-flex items-center gap-1 text-xs text-red-300 hover:text-red-200 px-2">
                    <X className="w-3.5 h-3.5" /> Remove
                  </button>
                )}
                <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={onFile} className="hidden" />
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 pt-2">
          <label className="inline-flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="accent-gold-500" />
            <span className="text-sm text-cream/85">Visible on menu</span>
          </label>
          <label className="inline-flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.isFeatured} onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })} className="accent-gold-500" />
            <span className="text-sm text-cream/85">Featured on home</span>
          </label>
        </div>

        <div className="flex gap-2 justify-end pt-3 border-t border-gold-900/30">
          <button type="button" onClick={onClose} className="btn-outline-gold !px-4 !py-2 text-sm">
            Cancel
          </button>
          <button disabled={loading} className="btn-gold !px-4 !py-2 text-sm disabled:opacity-60">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Create item
          </button>
        </div>
      </form>
    </div>
  );
}
