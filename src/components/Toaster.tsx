"use client";

import { create } from "zustand";
import { useEffect } from "react";

type Toast = { id: string; msg: string; type: "success" | "error" | "info" };

type Store = {
  toasts: Toast[];
  push: (msg: string, type?: Toast["type"]) => void;
  remove: (id: string) => void;
};

export const useToast = create<Store>((set) => ({
  toasts: [],
  push: (msg, type = "info") => {
    const id = Math.random().toString(36).slice(2);
    set((s) => ({ toasts: [...s.toasts, { id, msg, type }] }));
    setTimeout(() => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })), 3500);
  },
  remove: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));

export function toast(msg: string, type: Toast["type"] = "info") {
  useToast.getState().push(msg, type);
}

export function Toaster() {
  const toasts = useToast((s) => s.toasts);
  const remove = useToast((s) => s.remove);

  // Avoid hydration mismatch
  useEffect(() => {}, []);

  return (
    <div className="fixed top-20 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          onClick={() => remove(t.id)}
          className={`pointer-events-auto cursor-pointer rounded-lg px-4 py-3 shadow-gold border max-w-sm text-sm ${
            t.type === "success"
              ? "bg-green-900/80 border-green-500/50 text-green-100"
              : t.type === "error"
              ? "bg-red-900/80 border-red-500/50 text-red-100"
              : "bg-ink-800 border-gold-500/40 text-cream"
          }`}
        >
          {t.msg}
        </div>
      ))}
    </div>
  );
}
