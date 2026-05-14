"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import Link from "next/link";
import { toast } from "@/components/Toaster";
import { ArrowRight } from "lucide-react";
import type { Dict } from "@/lib/i18n";

export function RegisterForm({ t }: { t: Dict }) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Registration failed");
      const signRes = await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
      });
      if (signRes?.error) throw new Error("Sign-in failed");
      toast(t.registerCreated, "success");
      window.location.assign("/account");
    } catch (err) {
      const msg = err instanceof Error ? err.message : t.toastSomethingWrong;
      toast(msg, "error");
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <h1 className="font-display text-4xl font-bold text-center">
        <span className="text-gold-gradient">{t.registerTitle}</span>
      </h1>
      <p className="text-center text-cream/70 mt-2">{t.registerSubtitle}</p>

      <form onSubmit={onSubmit} className="mt-8 card p-6 space-y-4">
        <div>
          <label className="label-dark">{t.registerFullName}</label>
          <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-dark" />
        </div>
        <div>
          <label className="label-dark">{t.contactEmail}</label>
          <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input-dark" />
        </div>
        <div>
          <label className="label-dark">{t.registerPhoneOpt}</label>
          <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input-dark" />
        </div>
        <div>
          <label className="label-dark">{t.registerPasswordHint}</label>
          <input required type="password" minLength={6} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="input-dark" />
        </div>
        <button disabled={loading} className="btn-gold w-full disabled:opacity-60">
          {loading ? t.registerCreating : t.registerCreate} <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      <p className="text-center text-sm text-cream/70 mt-5">
        {t.registerHaveAccount}{" "}
        <Link href="/auth/login" className="text-gold-300 hover:text-gold-200 font-semibold">
          {t.authSignIn}
        </Link>
      </p>
    </div>
  );
}
