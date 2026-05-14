"use client";

import { Globe } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function LanguageToggle({ lang, otherLabel }: { lang: "en" | "vn"; otherLabel: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  function toggle() {
    const next = lang === "en" ? "vn" : "en";
    document.cookie = `gs-lang=${next};path=/;max-age=${60 * 60 * 24 * 365};SameSite=Lax`;
    setLoading(true);
    router.refresh();
    // Re-enable after a moment in case refresh doesn't trigger a remount
    setTimeout(() => setLoading(false), 600);
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border border-gold-900/50 text-cream/85 hover:bg-gold-500/10 hover:border-gold-500/40 hover:text-gold-300 transition-colors disabled:opacity-60"
      aria-label="Toggle language"
      title={otherLabel}
    >
      <Globe className="w-3.5 h-3.5" />
      <span>{otherLabel}</span>
    </button>
  );
}
