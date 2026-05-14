"use client";

import { useState } from "react";
import { toast } from "@/components/Toaster";
import { Send } from "lucide-react";
import type { Dict } from "@/lib/i18n";

export function ContactForm({ t }: { t: Dict }) {
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fd.get("name"),
          email: fd.get("email"),
          phone: fd.get("phone") || undefined,
          message: fd.get("message"),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || t.toastSomethingWrong);
      (e.target as HTMLFormElement).reset();
      toast(t.contactSent, "success");
    } catch (err) {
      toast(err instanceof Error ? err.message : t.toastSomethingWrong, "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="label-dark">{t.contactName}</label>
          <input required name="name" className="input-dark" />
        </div>
        <div>
          <label className="label-dark">{t.contactPhone}</label>
          <input name="phone" className="input-dark" />
        </div>
      </div>
      <div>
        <label className="label-dark">{t.contactEmail}</label>
        <input required type="email" name="email" className="input-dark" />
      </div>
      <div>
        <label className="label-dark">{t.contactMessage}</label>
        <textarea required name="message" rows={5} className="input-dark" />
      </div>
      <button disabled={loading} className="btn-gold w-full sm:w-auto disabled:opacity-60">
        <Send className="w-4 h-4" /> {loading ? t.sending : t.contactSend}
      </button>
    </form>
  );
}
