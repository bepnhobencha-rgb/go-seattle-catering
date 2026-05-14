"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartTopping = { id: string; name: string; price: number };

export type CartItem = {
  id: string;            // unique cart line id
  menuItemId: string;
  code?: string | null;
  nameEn: string;
  nameVn?: string | null;
  unitPrice: number;
  qty: number;
  toppings: CartTopping[];
  notes?: string;
  image?: string | null;
};

type State = {
  items: CartItem[];
};

type Actions = {
  add: (item: Omit<CartItem, "id">) => void;
  remove: (id: string) => void;
  updateQty: (id: string, qty: number) => void;
  clear: () => void;
  subtotal: () => number;
};

export const useCart = create<State & Actions>()(
  persist(
    (set, get) => ({
      items: [],
      add: (item) =>
        set((s) => {
          // Group same menuItem + same toppings as one line
          const key = item.menuItemId + ":" + item.toppings.map((t) => t.id).sort().join(",");
          const idx = s.items.findIndex(
            (i) => i.menuItemId + ":" + i.toppings.map((t) => t.id).sort().join(",") === key
          );
          if (idx >= 0) {
            const next = [...s.items];
            next[idx] = { ...next[idx], qty: next[idx].qty + item.qty };
            return { items: next };
          }
          const id = `${item.menuItemId}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
          return { items: [...s.items, { ...item, id }] };
        }),
      remove: (id) => set((s) => ({ items: s.items.filter((i) => i.id !== id) })),
      updateQty: (id, qty) =>
        set((s) => ({
          items: qty <= 0 ? s.items.filter((i) => i.id !== id) : s.items.map((i) => (i.id === id ? { ...i, qty } : i)),
        })),
      clear: () => set({ items: [] }),
      subtotal: () => {
        const items = get().items;
        return items.reduce((sum, i) => {
          const toppingTotal = i.toppings.reduce((s, t) => s + t.price, 0);
          return sum + (i.unitPrice + toppingTotal) * i.qty;
        }, 0);
      },
    }),
    { name: "go-seattle-cart" }
  )
);
