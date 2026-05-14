"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { EVENT_TYPES, EVENT_TYPE_LABEL, SERVICE_STYLES, SERVICE_STYLE_LABEL, BUDGET_RANGES } from "@/lib/enums";
import { toast } from "@/components/Toaster";
import { ArrowRight } from "lucide-react";

export function CateringForm({
  minGuests = 10,
  maxGuests = 1000,
}: {
  minGuests?: number;
  maxGuests?: number;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    eventType: "WEDDING",
    eventDate: "",
    eventTime: "",
    guestCount: Math.max(minGuests, 50),
    serviceStyle: "BUFFET",
    budgetRange: "",
    menuRequests: "",
    customerName: "",
    phone: "",
    email: "",
  });

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/catering", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit");
      toast("Request sent! We'll be in touch soon.", "success");
      router.push(`/catering/success?n=${data.requestNumber}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      toast(msg, "error");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="label-dark">Event type *</label>
          <select
            value={form.eventType}
            onChange={(e) => setForm({ ...form, eventType: e.target.value })}
            className="input-dark"
          >
            {EVENT_TYPES.map((t) => (
              <option key={t} value={t} className="bg-ink-800">
                {EVENT_TYPE_LABEL[t]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label-dark">Service style *</label>
          <select
            value={form.serviceStyle}
            onChange={(e) => setForm({ ...form, serviceStyle: e.target.value })}
            className="input-dark"
          >
            {SERVICE_STYLES.map((s) => (
              <option key={s} value={s} className="bg-ink-800">
                {SERVICE_STYLE_LABEL[s]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <div>
          <label className="label-dark">Event date *</label>
          <input
            required
            type="date"
            value={form.eventDate}
            onChange={(e) => setForm({ ...form, eventDate: e.target.value })}
            className="input-dark"
            min={new Date().toISOString().slice(0, 10)}
          />
        </div>
        <div>
          <label className="label-dark">Start time *</label>
          <input
            required
            type="time"
            value={form.eventTime}
            onChange={(e) => setForm({ ...form, eventTime: e.target.value })}
            className="input-dark"
          />
        </div>
        <div>
          <label className="label-dark">Guests *</label>
          <input
            required
            type="number"
            min={minGuests}
            max={maxGuests}
            value={form.guestCount}
            onChange={(e) => setForm({ ...form, guestCount: parseInt(e.target.value || "0") })}
            className="input-dark"
          />
        </div>
      </div>

      <div>
        <label className="label-dark">Budget range (optional)</label>
        <select
          value={form.budgetRange}
          onChange={(e) => setForm({ ...form, budgetRange: e.target.value })}
          className="input-dark"
        >
          <option value="" className="bg-ink-800">Not sure / open</option>
          {BUDGET_RANGES.map((b) => (
            <option key={b} value={b} className="bg-ink-800">{b}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="label-dark">Menu requests / dietary needs</label>
        <textarea
          rows={3}
          value={form.menuRequests}
          onChange={(e) => setForm({ ...form, menuRequests: e.target.value })}
          className="input-dark"
          placeholder="e.g. vegetarian options, no peanuts, traditional wedding menu…"
        />
      </div>

      <div className="divider-gold" />

      <h3 className="font-display text-lg font-bold text-gold-200">Contact info</h3>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="label-dark">Your name *</label>
          <input
            required
            value={form.customerName}
            onChange={(e) => setForm({ ...form, customerName: e.target.value })}
            className="input-dark"
          />
        </div>
        <div>
          <label className="label-dark">Phone *</label>
          <input
            required
            type="tel"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="input-dark"
          />
        </div>
      </div>
      <div>
        <label className="label-dark">Email *</label>
        <input
          required
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="input-dark"
        />
      </div>

      <button disabled={loading} className="btn-gold w-full disabled:opacity-60">
        {loading ? "Submitting…" : "Submit request"} <ArrowRight className="w-4 h-4" />
      </button>
      <p className="text-xs text-cream/55 text-center">
        We&apos;ll reply within 24–48 hours with a custom quote.
      </p>
    </form>
  );
}
