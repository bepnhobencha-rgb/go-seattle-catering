"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, ShoppingBag, User } from "lucide-react";
import { Logo } from "./Logo";
import { LanguageToggle } from "./LanguageToggle";
import { useCart } from "@/lib/cart-store";
import type { Dict, Lang } from "@/lib/i18n";

export function Header({
  logo,
  brandName,
  lang,
  t,
}: {
  logo?: string;
  brandName?: string;
  lang: Lang;
  t: Dict;
}) {
  const [open, setOpen] = useState(false);
  const count = useCart((s) => s.items.reduce((n, i) => n + i.qty, 0));

  const NAV = [
    { href: "/menu", label: t.navMenu },
    { href: "/catering", label: t.navCatering },
    { href: "/about", label: t.navAbout },
    { href: "/contact", label: t.navContact },
  ];

  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-ink-900/85 border-b border-gold-900/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
        <Logo src={logo} brandName={brandName} />

        <nav className="hidden md:flex items-center gap-7">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="text-sm font-medium text-cream/85 hover:text-gold-300 transition-colors"
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <LanguageToggle lang={lang} otherLabel={t.langLabel} />
          <Link
            href="/cart"
            className="relative p-2 rounded-full hover:bg-gold-500/10 transition-colors"
            aria-label="Cart"
          >
            <ShoppingBag className="w-5 h-5 text-gold-300" />
            {count > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-gold-gradient text-ink-900 text-[10px] font-bold rounded-full flex items-center justify-center">
                {count}
              </span>
            )}
          </Link>
          <Link
            href="/account"
            className="hidden sm:inline-flex p-2 rounded-full hover:bg-gold-500/10 transition-colors"
            aria-label={t.navAccount}
          >
            <User className="w-5 h-5 text-gold-300" />
          </Link>
          <button
            onClick={() => setOpen((v) => !v)}
            className="md:hidden p-2 rounded-full hover:bg-gold-500/10"
            aria-label="Toggle menu"
          >
            {open ? <X className="w-5 h-5 text-gold-300" /> : <Menu className="w-5 h-5 text-gold-300" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-gold-900/40 bg-ink-900">
          <div className="px-4 py-3 flex flex-col gap-1">
            {NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                onClick={() => setOpen(false)}
                className="px-3 py-2 rounded-md text-cream/90 hover:bg-gold-500/10 hover:text-gold-300"
              >
                {n.label}
              </Link>
            ))}
            <Link
              href="/account"
              onClick={() => setOpen(false)}
              className="px-3 py-2 rounded-md text-cream/90 hover:bg-gold-500/10 hover:text-gold-300"
            >
              {t.navAccount}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
