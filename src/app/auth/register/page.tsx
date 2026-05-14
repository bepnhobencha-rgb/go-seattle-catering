"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import Link from "next/link";
import { toast } from "@/components/Toaster";
import { ArrowRight } from "lucide-react";

export default function RegisterPage() {
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
      toast("Account created!", "success");
      // Full-page redirect so middleware sees the freshly-set session cookie.
      window.location.assign("/account");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      toast(msg, "error");
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <h1 className="font-display text-4xl font-bold text-center">
        <span className="text-gold-gradient">Create account</span>
      </h1>
      <p className="text-center text-cream/70 mt-2">Save your orders & catering requests</p>

      <form onSubmit={onSubmit} className="mt-8 card p-6 space-y-4">
        <div>
          <label className="label-dark">Full name</label>
          <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-dark" />
        </div>
        <div>
          <label className="label-dark">Email</label>
          <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input-dark" />
        </div>
        <div>
          <label className="label-dark">Phone (optional)</label>
          <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input-dark" />
        </div>
        <div>
          <label className="label-dark">Password (min 6 chars)</label>
          <input required type="password" minLength={6} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="input-dark" />
        </div>
        <button disabled={loading} className="btn-gold w-full disabled:opacity-60">
          {loading ? "Creating…" : "Create account"} <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      <p className="text-center text-sm text-cream/70 mt-5">
        Already have an account?{" "}
        <Link href="/auth/login" className="text-gold-300 hover:text-gold-200 font-semibold">
          Sign in
        </Link>
      </p>
    </div>
  );
}
