"use client";

import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { toast } from "@/components/Toaster";
import { ArrowRight } from "lucide-react";

export function LoginForm() {
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") || "/account";
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    // First, validate credentials without redirecting so we can show an inline error.
    const check = await signIn("credentials", {
      email: form.email,
      password: form.password,
      redirect: false,
    });

    if (check?.error) {
      setLoading(false);
      toast("Invalid email or password", "error");
      return;
    }

    // Credentials valid — perform a full-page redirect so the new session cookie
    // is read by middleware on the next request (avoids the App Router state
    // race that can leave you on the login page after router.push).
    toast("Welcome back!", "success");
    window.location.assign(callbackUrl || "/account");
  }

  return (
    <>
      <form onSubmit={onSubmit} className="mt-8 card p-6 space-y-4">
        <div>
          <label className="label-dark">Email</label>
          <input
            required
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="input-dark"
          />
        </div>
        <div>
          <label className="label-dark">Password</label>
          <input
            required
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="input-dark"
          />
        </div>
        <button disabled={loading} className="btn-gold w-full disabled:opacity-60">
          {loading ? "Signing in…" : "Sign in"} <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      <p className="text-center text-sm text-cream/70 mt-5">
        Don&apos;t have an account?{" "}
        <Link href="/auth/register" className="text-gold-300 hover:text-gold-200 font-semibold">
          Sign up
        </Link>
      </p>
    </>
  );
}
