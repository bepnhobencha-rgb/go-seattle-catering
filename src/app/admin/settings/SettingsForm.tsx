"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "@/components/Toaster";
import {
  Save, Trash2, Plus, CheckCircle2, AlertCircle, Loader2, Upload, X, ImageIcon,
  Building2, MapPin, Clock, Type, Settings as SettingsIcon, CreditCard, Eye, EyeOff,
  Construction, ExternalLink,
} from "lucide-react";
import Link from "next/link";
import type { SiteSettings, Hour } from "@/lib/settings";

export function SettingsForm({ initial }: { initial: SiteSettings }) {
  const router = useRouter();
  const [s, setS] = useState<SiteSettings>(initial);
  const [loading, setLoading] = useState(false);

  function setHour(i: number, patch: Partial<Hour>) {
    setS({ ...s, hours: s.hours.map((h, idx) => (idx === i ? { ...h, ...patch } : h)) });
  }
  function addHour() {
    setS({ ...s, hours: [...s.hours, { day: "", hours: "" }] });
  }
  function removeHour(i: number) {
    setS({ ...s, hours: s.hours.filter((_, idx) => idx !== i) });
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(s),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      toast(data.error || "Save failed", "error");
      return;
    }
    toast("Settings saved", "success");
    router.refresh();
  }

  return (
    <form onSubmit={save} className="space-y-6">
      {s.maintenanceMode && (
        <div className="card border-yellow-500/50 bg-yellow-500/10 p-4 flex items-start gap-3">
          <Construction className="w-5 h-5 text-yellow-300 shrink-0 mt-0.5" />
          <div className="flex-1 text-sm">
            <p className="font-bold text-yellow-200">Maintenance mode is ON</p>
            <p className="text-yellow-100/80 mt-0.5">
              Your public website is currently showing the &quot;Coming Soon&quot; page to all visitors.
              Toggle it off below when you&apos;re ready to go live.
            </p>
            <Link
              href="/maintenance"
              target="_blank"
              className="inline-flex items-center gap-1 mt-2 text-xs underline text-yellow-200 hover:text-yellow-100"
            >
              Preview the public page <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </div>
      )}

      <MaintenanceSection s={s} setS={setS} />

      <Section icon={Building2} title="Brand">
        <LogoField logo={s.logo} setLogo={(v) => setS({ ...s, logo: v })} />
        <Field label="Business name">
          <input className="input-dark" value={s.name} onChange={(e) => setS({ ...s, name: e.target.value })} />
        </Field>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Slogan (English)">
            <input className="input-dark" value={s.sloganEn} onChange={(e) => setS({ ...s, sloganEn: e.target.value })} />
          </Field>
          <Field label="Slogan (Vietnamese)">
            <input className="input-dark" value={s.sloganVn} onChange={(e) => setS({ ...s, sloganVn: e.target.value })} />
          </Field>
        </div>
      </Section>

      <Section icon={MapPin} title="Contact">
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Phone">
            <input className="input-dark" value={s.phone} onChange={(e) => setS({ ...s, phone: e.target.value })} placeholder="(206) 555-0100" />
          </Field>
          <Field label="Email">
            <input className="input-dark" type="email" value={s.email} onChange={(e) => setS({ ...s, email: e.target.value })} placeholder="hello@example.com" />
          </Field>
        </div>
        <Field label="Address">
          <input className="input-dark" value={s.address} onChange={(e) => setS({ ...s, address: e.target.value })} placeholder="123 Main St, Seattle, WA 98101" />
        </Field>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Website">
            <input className="input-dark" value={s.website} onChange={(e) => setS({ ...s, website: e.target.value })} placeholder="goseattlecatering.com" />
          </Field>
          <Field label="Facebook URL">
            <input className="input-dark" value={s.facebook} onChange={(e) => setS({ ...s, facebook: e.target.value })} placeholder="https://facebook.com/…" />
          </Field>
        </div>
        <Field label="Custom Google Maps embed URL (optional)" hint="Paste the URL from Google Maps → Share → Embed iframe src. Leaves blank to auto-generate from address.">
          <input className="input-dark" value={s.mapEmbedUrl} onChange={(e) => setS({ ...s, mapEmbedUrl: e.target.value })} placeholder="https://www.google.com/maps/embed?pb=…" />
        </Field>
      </Section>

      <Section icon={Clock} title="Hours">
        <div className="space-y-2">
          {s.hours.map((h, i) => (
            <div key={i} className="flex gap-2 items-center">
              <input className="input-dark !w-24" value={h.day} onChange={(e) => setHour(i, { day: e.target.value })} placeholder="Mon" />
              <input className="input-dark flex-1" value={h.hours} onChange={(e) => setHour(i, { hours: e.target.value })} placeholder="10:00 AM – 8:00 PM" />
              <button type="button" onClick={() => removeHour(i)} className="p-2 text-cream/50 hover:text-red-400" aria-label="Remove">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          <button type="button" onClick={addHour} className="btn-outline-gold !px-3 !py-1.5 text-xs">
            <Plus className="w-3.5 h-3.5" /> Add row
          </button>
        </div>
      </Section>

      <Section icon={Type} title="Content (home + about)">
        <Field label="Hero headline — line 1" hint="Shown in large gold gradient.">
          <input className="input-dark" value={s.homeHeroLine1} onChange={(e) => setS({ ...s, homeHeroLine1: e.target.value })} />
        </Field>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Hero headline — line 2">
            <input className="input-dark" value={s.homeHeroLine2} onChange={(e) => setS({ ...s, homeHeroLine2: e.target.value })} />
          </Field>
          <Field label="Hero headline — line 3 (optional)">
            <input className="input-dark" value={s.homeHeroLine3} onChange={(e) => setS({ ...s, homeHeroLine3: e.target.value })} />
          </Field>
        </div>
        <Field label="Hero intro paragraph">
          <textarea rows={2} className="input-dark" value={s.homeHeroIntro} onChange={(e) => setS({ ...s, homeHeroIntro: e.target.value })} />
        </Field>
        <Field label="About page story" hint="Use blank lines to separate paragraphs.">
          <textarea rows={8} className="input-dark" value={s.aboutStory} onChange={(e) => setS({ ...s, aboutStory: e.target.value })} />
        </Field>
      </Section>

      <Section icon={SettingsIcon} title="Operations">
        <div className="grid sm:grid-cols-3 gap-4">
          <Field label="Tax rate" hint="Decimal (0.1025 = 10.25%)">
            <input
              type="number"
              step="0.0001"
              min="0"
              max="1"
              className="input-dark"
              value={s.taxRate}
              onChange={(e) => setS({ ...s, taxRate: parseFloat(e.target.value || "0") })}
            />
          </Field>
          <Field label="Tax label">
            <input className="input-dark" value={s.taxLabel} onChange={(e) => setS({ ...s, taxLabel: e.target.value })} />
          </Field>
          <Field label="Currency">
            <input className="input-dark uppercase" maxLength={6} value={s.currency} onChange={(e) => setS({ ...s, currency: e.target.value.toUpperCase() })} />
          </Field>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Earliest pickup (minutes from now)">
            <input type="number" min="0" max="1440" className="input-dark" value={s.minPickupMinutes} onChange={(e) => setS({ ...s, minPickupMinutes: parseInt(e.target.value || "0") })} />
          </Field>
          <Field label="Latest pickup (days ahead)">
            <input type="number" min="1" max="60" className="input-dark" value={s.maxPickupDays} onChange={(e) => setS({ ...s, maxPickupDays: parseInt(e.target.value || "1") })} />
          </Field>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Catering — min guests">
            <input type="number" min="1" max="10000" className="input-dark" value={s.cateringMinGuests} onChange={(e) => setS({ ...s, cateringMinGuests: parseInt(e.target.value || "1") })} />
          </Field>
          <Field label="Catering — max guests">
            <input type="number" min="1" max="10000" className="input-dark" value={s.cateringMaxGuests} onChange={(e) => setS({ ...s, cateringMaxGuests: parseInt(e.target.value || "1") })} />
          </Field>
        </div>
      </Section>

      <PaymentSection s={s} setS={setS} />

      <div className="flex items-center gap-3 sticky bottom-4 z-10">
        <button disabled={loading} className="btn-gold disabled:opacity-60 shadow-gold-lg">
          <Save className="w-4 h-4" /> {loading ? "Saving…" : "Save settings"}
        </button>
        <p className="text-xs text-cream/55">Changes appear on the public site immediately.</p>
      </div>
    </form>
  );
}

function MaintenanceSection({ s, setS }: { s: SiteSettings; setS: (s: SiteSettings) => void }) {
  return (
    <section className="card p-6 space-y-4 border-gold-500/30">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h3 className="font-display text-lg font-bold text-gold-200 flex items-center gap-2">
          <Construction className="w-5 h-5" /> Maintenance · &quot;Coming Soon&quot; page
        </h3>
        <label className="inline-flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            className="sr-only"
            checked={s.maintenanceMode}
            onChange={(e) => setS({ ...s, maintenanceMode: e.target.checked })}
          />
          <span
            className={`relative w-12 h-6 rounded-full transition-colors ${
              s.maintenanceMode ? "bg-yellow-500" : "bg-ink-800 border border-gold-900/60"
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-cream transition-transform ${
                s.maintenanceMode ? "translate-x-6" : ""
              }`}
            />
          </span>
          <span className="text-sm text-cream/85">{s.maintenanceMode ? "ON" : "OFF"}</span>
        </label>
      </div>
      <p className="text-xs text-cream/60">
        When ON, all public pages (home, menu, cart, catering, etc.) redirect to a classy &quot;Coming Soon&quot;
        page. Admin and login remain accessible so you can disable it later.
      </p>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="label-dark">Headline</label>
          <input
            className="input-dark"
            value={s.maintenanceTitle}
            onChange={(e) => setS({ ...s, maintenanceTitle: e.target.value })}
            placeholder="We're crafting something special"
          />
        </div>
        <div>
          <label className="label-dark">
            <Link href="/maintenance" target="_blank" className="text-gold-300 hover:underline inline-flex items-center gap-1">
              Preview <ExternalLink className="w-3 h-3" />
            </Link>
          </label>
          <p className="text-xs text-cream/60 italic mt-2">Opens the public Coming Soon page in a new tab.</p>
        </div>
      </div>
      <div>
        <label className="label-dark">Message</label>
        <textarea
          rows={3}
          className="input-dark"
          value={s.maintenanceMessage}
          onChange={(e) => setS({ ...s, maintenanceMessage: e.target.value })}
          placeholder="Our website is currently being prepared…"
        />
      </div>
    </section>
  );
}

function LogoField({ logo, setLogo }: { logo: string; setLogo: (v: string) => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast("File too large (max 5 MB)", "error");
      e.target.value = "";
      return;
    }
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    try {
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      setLogo(data.url);
      toast("Logo uploaded — click Save to apply", "success");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Upload failed", "error");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  return (
    <div>
      <label className="label-dark">Logo</label>
      <div className="flex gap-4 items-start">
        <div className="w-24 h-24 rounded-lg overflow-hidden bg-ink-950 border border-gold-900/40 shrink-0 relative">
          {logo ? (
            <Image src={logo} alt="Logo" fill sizes="96px" className="object-contain" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gold-900/60">
              <ImageIcon className="w-7 h-7" />
            </div>
          )}
        </div>
        <div className="flex-1 space-y-2">
          <input
            type="text"
            value={logo}
            onChange={(e) => setLogo(e.target.value)}
            placeholder="/images/logos/logo-dark.jpg or https://…"
            className="input-dark text-sm"
          />
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="btn-outline-gold !py-2 !px-3 text-xs disabled:opacity-60"
            >
              {uploading ? (
                <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Uploading…</>
              ) : (
                <><Upload className="w-3.5 h-3.5" /> Upload new logo</>
              )}
            </button>
            {logo && logo !== "/images/logos/logo-dark.jpg" && (
              <button
                type="button"
                onClick={() => setLogo("/images/logos/logo-dark.jpg")}
                className="inline-flex items-center gap-1 text-xs text-cream/60 hover:text-cream px-2"
              >
                <X className="w-3.5 h-3.5" /> Reset to default
              </button>
            )}
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/svg+xml,image/gif"
              onChange={onFile}
              className="hidden"
            />
          </div>
          <p className="text-[10px] text-cream/50">
            Square or transparent PNG/SVG works best. Max 5 MB.
          </p>
        </div>
      </div>
    </div>
  );
}

function Section({ icon: Icon, title, children }: { icon: React.ComponentType<{ className?: string }>; title: string; children: React.ReactNode }) {
  return (
    <section className="card p-6 space-y-4">
      <h3 className="font-display text-lg font-bold text-gold-200 flex items-center gap-2">
        <Icon className="w-5 h-5" /> {title}
      </h3>
      {children}
    </section>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="label-dark">{label}</label>
      {children}
      {hint && <p className="text-[10px] text-cream/50 mt-1">{hint}</p>}
    </div>
  );
}

function PaymentSection({ s, setS }: { s: SiteSettings; setS: (s: SiteSettings) => void }) {
  const [showSecret, setShowSecret] = useState(false);
  const [showWebhook, setShowWebhook] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string } | null>(null);

  async function testConnection() {
    if (!s.stripeSecretKey || s.stripeSecretKey === "***") {
      setTestResult({ ok: false, message: "Save the secret key first, then test." });
      return;
    }
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch("/api/admin/stripe/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secretKey: s.stripeSecretKey }),
      });
      const data = await res.json();
      if (data.ok) {
        const mode = data.account.mode === "live" ? "LIVE" : "TEST";
        setTestResult({
          ok: true,
          message: `${mode} mode · Account ${data.account.id} · ${data.account.email || ""} · ${data.account.chargesEnabled ? "Charges enabled" : "Charges NOT enabled"}`,
        });
      } else {
        setTestResult({ ok: false, message: data.error || "Connection failed" });
      }
    } catch (err) {
      setTestResult({ ok: false, message: err instanceof Error ? err.message : "Test failed" });
    } finally {
      setTesting(false);
    }
  }

  return (
    <section className="card p-6 space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h3 className="font-display text-lg font-bold text-gold-200 flex items-center gap-2">
          <CreditCard className="w-5 h-5" /> Online payment · Stripe
        </h3>
        <label className="inline-flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            className="sr-only"
            checked={s.stripeEnabled}
            onChange={(e) => setS({ ...s, stripeEnabled: e.target.checked })}
          />
          <span className={`relative w-11 h-6 rounded-full transition-colors ${s.stripeEnabled ? "bg-gold-gradient" : "bg-ink-800 border border-gold-900/60"}`}>
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-cream transition-transform ${s.stripeEnabled ? "translate-x-5" : ""}`} />
          </span>
          <span className="text-sm text-cream/85">{s.stripeEnabled ? "Enabled" : "Disabled"}</span>
        </label>
      </div>

      <div className="flex gap-2">
        {(["test", "live"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setS({ ...s, stripeMode: m })}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
              s.stripeMode === m
                ? m === "live"
                  ? "bg-red-500/20 border-red-500/60 text-red-200"
                  : "bg-gold-gradient text-ink-900 border-transparent"
                : "border-gold-900/50 text-cream/75 hover:border-gold-500/40"
            }`}
          >
            {m.toUpperCase()} mode
          </button>
        ))}
        {s.stripeMode === "live" && (
          <span className="text-xs text-red-300 italic self-center">⚠ Real money — use carefully</span>
        )}
      </div>

      <Field
        label="Publishable key"
        hint={s.stripeMode === "test" ? "Starts with pk_test_…" : "Starts with pk_live_…"}
      >
        <input
          className="input-dark font-mono text-xs"
          value={s.stripePublishableKey}
          onChange={(e) => setS({ ...s, stripePublishableKey: e.target.value })}
          placeholder={s.stripeMode === "test" ? "pk_test_…" : "pk_live_…"}
        />
      </Field>

      <Field
        label="Secret key"
        hint={s.stripeMode === "test" ? "Starts with sk_test_… — never shared publicly" : "Starts with sk_live_… — never shared publicly"}
      >
        <div className="relative">
          <input
            type={showSecret ? "text" : "password"}
            className="input-dark font-mono text-xs pr-10"
            value={s.stripeSecretKey}
            onChange={(e) => setS({ ...s, stripeSecretKey: e.target.value })}
            placeholder={s.stripeMode === "test" ? "sk_test_…" : "sk_live_…"}
          />
          <button
            type="button"
            onClick={() => setShowSecret((v) => !v)}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gold-300 hover:text-gold-200"
            aria-label="Toggle visibility"
          >
            {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </Field>

      <Field
        label="Webhook signing secret"
        hint="Optional — required if you set up a webhook endpoint at /api/webhooks/stripe. Starts with whsec_…"
      >
        <div className="relative">
          <input
            type={showWebhook ? "text" : "password"}
            className="input-dark font-mono text-xs pr-10"
            value={s.stripeWebhookSecret}
            onChange={(e) => setS({ ...s, stripeWebhookSecret: e.target.value })}
            placeholder="whsec_…"
          />
          <button
            type="button"
            onClick={() => setShowWebhook((v) => !v)}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gold-300 hover:text-gold-200"
            aria-label="Toggle visibility"
          >
            {showWebhook ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </Field>

      <div className="flex items-start gap-3 flex-wrap">
        <button
          type="button"
          onClick={testConnection}
          disabled={testing || !s.stripeSecretKey}
          className="btn-outline-gold !px-4 !py-2 text-xs disabled:opacity-50"
        >
          {testing ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Testing…</> : "Test connection"}
        </button>
        {testResult && (
          <div className={`text-xs px-3 py-2 rounded-md border flex items-start gap-2 ${
            testResult.ok ? "bg-green-500/10 border-green-500/40 text-green-200" : "bg-red-500/10 border-red-500/40 text-red-200"
          }`}>
            {testResult.ok ? <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" /> : <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />}
            {testResult.message}
          </div>
        )}
      </div>

      <div className="text-xs text-cream/55 bg-ink-950/50 border border-gold-900/30 rounded-md p-3 space-y-1">
        <p><strong className="text-gold-300">Test mode quick start:</strong></p>
        <ol className="list-decimal pl-5 space-y-0.5">
          <li>Sign up at <span className="text-gold-300">stripe.com</span></li>
          <li>Dashboard → Developers → API keys → copy your <em>test</em> keys above</li>
          <li>Click <em>Test connection</em> to verify</li>
          <li>Enable Stripe + Save</li>
          <li>Place a test order using card <span className="font-mono">4242 4242 4242 4242</span>, any future expiry, any CVC</li>
        </ol>
      </div>
    </section>
  );
}
