"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { formatUSD } from "@/lib/utils";
import { toast } from "@/components/Toaster";
import { Eye, EyeOff, Save, Upload, X, ImageIcon, Loader2, Star } from "lucide-react";

type Item = {
  id: string;
  code: string | null;
  nameEn: string;
  nameVn: string | null;
  description: string | null;
  basePrice: number;
  image: string | null;
  isActive: boolean;
  isFeatured: boolean;
};

type Category = {
  id: string;
  slug: string;
  nameEn: string;
  nameVn: string;
  items: Item[];
};

export function MenuAdmin({ categories }: { categories: Category[] }) {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <div className="space-y-8">
      <p className="text-sm text-cream/60">
        Click a row to edit. Toggle availability with the eye icon. Replace photos by uploading
        or pasting a URL. Changes save immediately.
      </p>
      {categories.map((cat) => (
        <section key={cat.id}>
          <h2 className="font-display text-2xl font-bold text-gold-200 mb-3">
            {cat.nameEn} <span className="text-gold-400/70 italic text-sm">{cat.nameVn}</span>
          </h2>
          <div className="card divide-y divide-gold-900/40">
            {cat.items.map((it) => (
              <Row
                key={it.id}
                item={it}
                open={openId === it.id}
                onToggle={() => setOpenId(openId === it.id ? null : it.id)}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function Row({ item, open, onToggle }: { item: Item; open: boolean; onToggle: () => void }) {
  const router = useRouter();
  const [price, setPrice] = useState(item.basePrice.toString());
  const [desc, setDesc] = useState(item.description ?? "");
  const [image, setImage] = useState<string | null>(item.image);
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
    const next = !active;
    if (await patch({ isActive: next })) {
      setActive(next);
      toast(next ? "Item enabled" : "Item disabled", "success");
    }
  }

  async function toggleFeatured() {
    const next = !featured;
    if (await patch({ isFeatured: next })) {
      setFeatured(next);
      toast(next ? "Pinned to home" : "Removed from home", "success");
    }
  }

  async function save() {
    const p = parseFloat(price);
    if (isNaN(p) || p < 0) {
      toast("Invalid price", "error");
      return;
    }
    if (
      await patch({
        basePrice: p,
        description: desc.trim() || null,
        image: image ?? null,
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
      e.target.value = "";
      return;
    }
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    try {
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      setImage(data.url);
      toast("Image uploaded — click Save to persist", "success");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Upload failed", "error");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  function clearImage() {
    setImage(null);
  }

  const hasUnsavedImage = image !== item.image;

  return (
    <div>
      <div className="px-4 py-3 flex items-center gap-3">
        {/* Thumbnail */}
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
        <button
          onClick={toggleFeatured}
          className={`p-1.5 rounded-md ${
            featured ? "text-gold-400 hover:bg-gold-500/15" : "text-cream/30 hover:bg-cream/10"
          }`}
          title={featured ? "Featured on home page" : "Not featured"}
          aria-label="Toggle featured"
        >
          <Star className={`w-4 h-4 ${featured ? "fill-gold-400" : ""}`} />
        </button>
        <button
          onClick={toggleActive}
          className={`p-1.5 rounded-md ${
            active ? "text-green-400 hover:bg-green-500/15" : "text-cream/40 hover:bg-cream/10"
          }`}
          aria-label={active ? "Disable" : "Enable"}
          title={active ? "Visible on menu" : "Hidden from menu"}
        >
          {active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
        </button>
      </div>

      {open && (
        <div className="px-4 pb-5 grid sm:grid-cols-2 gap-4 border-t border-gold-900/30 bg-ink-950/40">
          {/* Image editor */}
          <div className="sm:col-span-2">
            <label className="label-dark">Image</label>
            <div className="flex gap-4 items-start">
              <div className="w-40 aspect-[4/3] rounded-lg overflow-hidden bg-ink-950 border border-gold-900/40 shrink-0 relative">
                {image ? (
                  <Image src={image} alt="" fill sizes="160px" className="object-cover" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-gold-900/60 text-xs">
                    <ImageIcon className="w-7 h-7 mb-1" />
                    No image
                  </div>
                )}
                {hasUnsavedImage && (
                  <span className="absolute top-1 right-1 bg-yellow-500/90 text-ink-900 text-[9px] font-bold px-1.5 py-0.5 rounded">
                    UNSAVED
                  </span>
                )}
              </div>
              <div className="flex-1 space-y-2">
                <input
                  type="text"
                  value={image ?? ""}
                  onChange={(e) => setImage(e.target.value || null)}
                  placeholder="Paste image URL (e.g. https://… or /images/food/banh-mi.jpg)"
                  className="input-dark text-sm"
                />
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    disabled={uploading}
                    className="btn-outline-gold !py-2 !px-3 text-xs disabled:opacity-60"
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" /> Uploading…
                      </>
                    ) : (
                      <>
                        <Upload className="w-3.5 h-3.5" /> Upload file
                      </>
                    )}
                  </button>
                  {image && (
                    <button
                      type="button"
                      onClick={clearImage}
                      className="inline-flex items-center gap-1 text-xs text-red-300 hover:text-red-200 px-2"
                    >
                      <X className="w-3.5 h-3.5" /> Remove image
                    </button>
                  )}
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    onChange={onFile}
                    className="hidden"
                  />
                </div>
                <p className="text-[10px] text-cream/50">
                  Max 5 MB. Supports JPEG, PNG, WebP, GIF.
                </p>
              </div>
            </div>
          </div>

          <div>
            <label className="label-dark">Price (USD)</label>
            <input
              type="number"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="input-dark"
            />
          </div>
          <div>
            <label className="label-dark">Description</label>
            <input
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              className="input-dark"
              placeholder="Short description"
            />
          </div>
          <div className="sm:col-span-2 flex items-center gap-3">
            <button onClick={save} disabled={loading} className="btn-gold disabled:opacity-60">
              <Save className="w-4 h-4" /> {loading ? "Saving…" : "Save changes"}
            </button>
            {hasUnsavedImage && (
              <span className="text-xs text-yellow-300/80">⚠ Image not saved yet</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
