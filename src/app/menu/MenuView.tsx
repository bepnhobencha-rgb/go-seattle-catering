"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { useCart } from "@/lib/cart-store";
import { formatUSD } from "@/lib/utils";
import { toast } from "@/components/Toaster";
import { Plus, Check, X } from "lucide-react";
import Link from "next/link";

type MenuItem = {
  id: string;
  code: string | null;
  nameEn: string;
  nameVn: string | null;
  description: string | null;
  basePrice: number;
  image: string | null;
};

type Category = {
  id: string;
  slug: string;
  nameEn: string;
  nameVn: string;
  items: MenuItem[];
};

type Topping = { id: string; name: string; price: number };

const DRINK_SLUGS = ["ice-juice", "milk-tea", "coffee", "smoothies"];

// Professional banner photo per category
const CATEGORY_BANNERS: Record<string, string> = {
  "rice-noodles-rolls": "/images/food/pho.jpg",
  "banh-mi": "/images/food/banh-mi-tray.jpg",
  "ice-juice": "/images/food/mango-smoothie.jpg",
  "milk-tea": "/images/food/ca-phe-da.jpg",
  "coffee": "/images/food/ca-phe.jpg",
  "smoothies": "/images/food/smoothies-3glass.jpg",
};

export function MenuView({ categories, toppings }: { categories: Category[]; toppings: Topping[] }) {
  const [active, setActive] = useState(categories[0]?.slug ?? "");
  const [selected, setSelected] = useState<MenuItem | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  function openItem(item: MenuItem, cat: Category) {
    setSelected(item);
    setSelectedCategory(cat);
  }

  return (
    <div>
      {/* Hero */}
      <section className="relative border-b border-gold-900/30 overflow-hidden">
        <div className="absolute inset-0 bg-gold-radial opacity-50" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-20 text-center">
          <p className="eyebrow">Our Menu</p>
          <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold mt-3">
            Taste of <span className="text-gold-gradient">Vietnam</span>
          </h1>
          <p className="mt-5 text-cream/70 max-w-2xl mx-auto">
            Made-to-order dishes · Wait time 10–15 minutes · Party trays available upon request
          </p>
        </div>
      </section>

      {/* Sticky category nav */}
      <nav className="sticky top-16 z-30 bg-ink-900/85 backdrop-blur-md border-b border-gold-900/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex gap-2 overflow-x-auto py-3 scrollbar-thin">
          {categories.map((c) => (
            <a
              key={c.slug}
              href={`#${c.slug}`}
              onClick={() => setActive(c.slug)}
              className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
                active === c.slug
                  ? "bg-gold-gradient text-ink-900 shadow-gold"
                  : "text-cream/75 hover:text-gold-300 hover:bg-gold-500/10 border border-gold-900/40"
              }`}
            >
              {c.nameEn}
            </a>
          ))}
        </div>
      </nav>

      {/* Categories */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-20">
        {categories.map((cat) => {
          const banner = CATEGORY_BANNERS[cat.slug];
          return (
            <section key={cat.id} id={cat.slug} className="scroll-mt-32">
              {/* Category banner */}
              {banner && (
                <div className="gold-frame mb-8 relative aspect-[21/6] sm:aspect-[5/1] overflow-hidden">
                  <Image
                    src={banner}
                    alt={cat.nameEn}
                    fill
                    sizes="100vw"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-ink-900/85 via-ink-900/40 to-transparent" />
                  <div className="absolute inset-0 flex flex-col justify-center px-8 sm:px-12">
                    <p className="text-gold-400 text-[10px] sm:text-xs tracking-[0.3em] uppercase font-semibold">
                      Category
                    </p>
                    <h2 className="font-display text-3xl sm:text-5xl font-bold mt-1">
                      <span className="text-gold-gradient">{cat.nameEn}</span>
                    </h2>
                    <p className="text-gold-300/80 italic mt-1 text-sm sm:text-base">{cat.nameVn}</p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
                {cat.items.map((item) => (
                  <ItemCard key={item.id} item={item} onSelect={() => openItem(item, cat)} />
                ))}
              </div>
            </section>
          );
        })}
      </div>

      {selected && selectedCategory && (
        <ItemModal
          item={selected}
          category={selectedCategory}
          toppings={DRINK_SLUGS.includes(selectedCategory.slug) ? toppings : []}
          onClose={() => {
            setSelected(null);
            setSelectedCategory(null);
          }}
        />
      )}

      <CartFloater />
    </div>
  );
}

function ItemCard({ item, onSelect }: { item: MenuItem; onSelect: () => void }) {
  return (
    <button
      onClick={onSelect}
      className="card card-hover overflow-hidden text-left group relative"
    >
      {item.image && (
        <div className="aspect-[16/10] overflow-hidden bg-ink-950 relative">
          <Image
            src={item.image}
            alt={item.nameEn}
            fill
            sizes="(min-width: 1024px) 25vw, 100vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink-900/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      )}
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            {item.code && <p className="text-xs text-gold-500/80 font-mono">{item.code}</p>}
            <h3 className="font-display font-bold text-lg text-cream mt-0.5">{item.nameEn}</h3>
            {item.nameVn && <p className="text-sm text-gold-300/70 italic truncate">{item.nameVn}</p>}
            {item.description && (
              <p className="text-xs text-cream/60 mt-2 line-clamp-2">{item.description}</p>
            )}
          </div>
          <div className="flex flex-col items-end gap-2 shrink-0">
            <span className="text-gold-300 font-display font-bold">{formatUSD(item.basePrice)}</span>
            <span className="w-9 h-9 rounded-full bg-gold-gradient text-ink-900 flex items-center justify-center group-hover:scale-110 group-hover:rotate-90 transition-transform duration-300">
              <Plus className="w-4 h-4" />
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}

function ItemModal({
  item,
  category,
  toppings,
  onClose,
}: {
  item: MenuItem;
  category: Category;
  toppings: Topping[];
  onClose: () => void;
}) {
  const add = useCart((s) => s.add);
  const [qty, setQty] = useState(1);
  const [picked, setPicked] = useState<string[]>([]);
  const [notes, setNotes] = useState("");

  const toppingsList = useMemo(() => toppings.filter((t) => picked.includes(t.id)), [toppings, picked]);
  const linePrice = useMemo(
    () => (item.basePrice + toppingsList.reduce((s, t) => s + t.price, 0)) * qty,
    [item.basePrice, toppingsList, qty]
  );

  function toggle(id: string) {
    setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
  }

  function handleAdd() {
    add({
      menuItemId: item.id,
      code: item.code,
      nameEn: item.nameEn,
      nameVn: item.nameVn,
      unitPrice: item.basePrice,
      qty,
      toppings: toppingsList,
      notes: notes.trim() || undefined,
      image: item.image,
    });
    toast(`${item.nameEn} added to cart`, "success");
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-0 sm:p-4"
      style={{ animation: "fade-in 200ms ease-out" }}
      onClick={onClose}
    >
      <div
        className="card w-full sm:max-w-lg max-h-[92vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl border-gold-500/30 shadow-gold-lg"
        onClick={(e) => e.stopPropagation()}
      >
        {item.image && (
          <div className="aspect-[2/1] relative overflow-hidden">
            <Image src={item.image} alt={item.nameEn} fill sizes="500px" className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-ink-900 via-ink-900/30 to-transparent" />
            <button
              onClick={onClose}
              className="absolute top-3 right-3 w-9 h-9 rounded-full bg-ink-900/80 backdrop-blur text-gold-300 hover:bg-ink-900 flex items-center justify-center"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        <div className="p-6">
          {!item.image && (
            <button
              onClick={onClose}
              className="float-right -mt-2 -mr-2 p-2 text-cream/60 hover:text-gold-300"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          )}
          <div className="flex items-start justify-between gap-4">
            <div>
              {item.code && <p className="text-xs text-gold-500/80 font-mono">{item.code}</p>}
              <h3 className="font-display text-2xl font-bold text-cream mt-1">{item.nameEn}</h3>
              {item.nameVn && <p className="text-gold-300/80 italic">{item.nameVn}</p>}
              <p className="text-xs text-cream/55 mt-2">{category.nameEn}</p>
            </div>
            <span className="text-2xl text-gold-300 font-display font-bold">{formatUSD(item.basePrice)}</span>
          </div>

          {item.description && (
            <p className="mt-3 text-sm text-cream/75">{item.description}</p>
          )}

          {toppings.length > 0 && (
            <div className="mt-6">
              <h4 className="label-dark mb-2">Add toppings</h4>
              <div className="grid grid-cols-2 gap-2">
                {toppings.map((t) => {
                  const on = picked.includes(t.id);
                  return (
                    <button
                      key={t.id}
                      onClick={() => toggle(t.id)}
                      className={`px-3 py-2 rounded-lg text-sm border text-left flex justify-between items-center transition-colors ${
                        on
                          ? "bg-gold-500/15 border-gold-500/60 text-gold-200"
                          : "border-gold-900/50 text-cream/80 hover:border-gold-500/40"
                      }`}
                    >
                      <span>{t.name}</span>
                      <span className="text-xs">
                        {on && <Check className="w-3.5 h-3.5 inline mr-1" />}
                        +{formatUSD(t.price)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="mt-6">
            <label className="label-dark">Special instructions (optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="input-dark"
              placeholder="e.g. extra spicy, no cilantro…"
            />
          </div>

          <div className="mt-6 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="w-10 h-10 rounded-full border border-gold-500/60 text-gold-300 hover:bg-gold-500/10 hover:border-gold-400 transition-all"
              >
                −
              </button>
              <span className="text-lg font-bold text-cream w-6 text-center">{qty}</span>
              <button
                onClick={() => setQty((q) => q + 1)}
                className="w-10 h-10 rounded-full border border-gold-500/60 text-gold-300 hover:bg-gold-500/10 hover:border-gold-400 transition-all"
              >
                +
              </button>
            </div>
            <button onClick={handleAdd} className="btn-gold">
              Add · {formatUSD(linePrice)}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function CartFloater() {
  const items = useCart((s) => s.items);
  const subtotal = useCart((s) => s.subtotal());
  const count = items.reduce((n, i) => n + i.qty, 0);
  if (count === 0) return null;
  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-30" style={{ animation: "fade-in-up 300ms ease-out" }}>
      <Link href="/cart" className="btn-gold shadow-gold-lg">
        View cart · {count} item{count > 1 ? "s" : ""} · {formatUSD(subtotal)}
      </Link>
    </div>
  );
}
