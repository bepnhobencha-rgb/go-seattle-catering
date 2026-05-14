"use client";

import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { toast } from "@/components/Toaster";
import { ArrowRight } from "lucide-react";
import type { Dict } from "@/lib/i18n";

export function LoginForm({ t }: { t: Dict }) {
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") || "/account";
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const check = await signIn("credentials", {
      email: form.email,
      password: form.password,
      redirect: false,
    });

    if (check?.error) {
      setLoading(false);
      toast(t.authInvalidLogin, "error");
      return;
    }
    toast(t.authWelcomeToast, "success");
    window.location.assign(callbackUrl || "/account");
  }

  return (
    <>
      <form onSubmit={onSubmit} className="mt-8 card p-6 space-y-4">
        <div>
          <label className="label-dark">{t.contactEmail}</label>
          <input
            required
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="input-dark"
          />
        </div>
        <div>
          <label className="label-dark">{t.authPassword}</label>
          <input
            required
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="input-dark"
          />
        </div>
        <button disabled={loading} className="btn-gold w-full disabled:opacity-60">
          {loading ? t.authSigningIn : t.authSignIn} <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      <p className="text-center text-sm text-cream/70 mt-5">
        {t.authNoAccount}{" "}
        <Link href="/auth/register" className="text-gold-300 hover:text-gold-200 font-semibold">
          {t.authSignUp}
        </Link>
      </p>
    </>
  );
}
