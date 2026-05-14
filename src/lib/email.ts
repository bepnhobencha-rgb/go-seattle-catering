import { Resend } from "resend";
import type { SiteSettings } from "./settings";

/** Format USD without importing from utils (avoid client/server boundary issues). */
function fmt(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
}

function getClient(apiKey: string) {
  if (!apiKey) return null;
  return new Resend(apiKey);
}

function recipient(s: SiteSettings) {
  return (s.notifyEmail || s.email || "").trim();
}

function fromAddress(s: SiteSettings) {
  // Until the admin verifies their own domain in Resend, every send must come
  // from the shared sandbox address Resend provides for free accounts.
  return `${s.name} <onboarding@resend.dev>`;
}

async function send(settings: SiteSettings, subject: string, html: string) {
  const to = recipient(settings);
  if (!settings.resendApiKey || !to) {
    console.log(`[Email] skipped (no key or recipient) — subject: ${subject}`);
    return { ok: false, reason: "not-configured" };
  }
  const client = getClient(settings.resendApiKey);
  if (!client) return { ok: false, reason: "no-client" };
  try {
    const res = await client.emails.send({
      from: fromAddress(settings),
      to,
      subject,
      html,
    });
    if (res.error) {
      console.error("[Email] send failed", res.error);
      return { ok: false, reason: res.error.message };
    }
    return { ok: true, id: res.data?.id };
  } catch (err) {
    console.error("[Email] threw", err);
    return { ok: false, reason: err instanceof Error ? err.message : "unknown" };
  }
}

/** Verify the Resend API key works. */
export async function testEmailConnection(apiKey: string) {
  const client = getClient(apiKey);
  if (!client) return { ok: false, error: "No API key" };
  try {
    const res = await client.domains.list();
    if (res.error) return { ok: false, error: res.error.message };
    return { ok: true, domains: res.data };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}

// ===== Notification templates =====

type OrderForEmail = {
  orderNumber: string;
  customerName: string;
  phone: string;
  email: string;
  pickupAt: Date;
  total: number;
  notes?: string | null;
  paymentMethod: string;
  items: Array<{
    quantity: number;
    unitPrice: number;
    toppings: string | null;
    notes: string | null;
    menuItem: { nameEn: string; code: string | null };
  }>;
};

export async function notifyNewOrder(settings: SiteSettings, order: OrderForEmail) {
  const itemRows = order.items
    .map((it) => {
      const toppings = it.toppings
        ? (JSON.parse(it.toppings) as Array<{ name: string; price: number }>)
        : [];
      const t = toppings.length ? `<br><small>+ ${toppings.map((x) => x.name).join(", ")}</small>` : "";
      const n = it.notes ? `<br><small><em>${it.notes}</em></small>` : "";
      return `<tr><td>${it.quantity}× ${it.menuItem.code ?? ""} ${it.menuItem.nameEn}${t}${n}</td><td style="text-align:right">${fmt(
        it.unitPrice * it.quantity
      )}</td></tr>`;
    })
    .join("");

  const html = `
    <div style="font-family:-apple-system,Helvetica,Arial,sans-serif;max-width:600px;margin:auto;background:#0A0A0A;color:#F5F5DC;padding:24px;border-radius:12px">
      <h2 style="color:#D4AF37;margin:0 0 8px">🍜 New order · ${order.orderNumber}</h2>
      <p>From <strong>${order.customerName}</strong> (${order.email} · ${order.phone})</p>
      <p>Pickup: <strong>${order.pickupAt.toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}</strong><br>
      Payment: <strong>${order.paymentMethod}</strong> · Total: <strong>${fmt(order.total)}</strong></p>
      ${order.notes ? `<p style="background:#1A1A1A;padding:12px;border-radius:6px"><em>${order.notes}</em></p>` : ""}
      <table style="width:100%;border-collapse:collapse;margin-top:12px">${itemRows}</table>
      <p style="margin-top:20px;font-size:12px;color:#999">View in admin: <a href="https://${settings.website || "goseattlecatering.com"}/admin/orders" style="color:#D4AF37">Open dashboard</a></p>
    </div>`;
  return send(settings, `New order · ${order.orderNumber} · ${fmt(order.total)}`, html);
}

type CateringForEmail = {
  requestNumber: string;
  customerName: string;
  email: string;
  phone: string;
  eventType: string;
  eventDate: Date;
  eventTime: string;
  guestCount: number;
  serviceStyle: string;
  budgetRange?: string | null;
  menuRequests?: string | null;
};

export async function notifyNewCatering(settings: SiteSettings, r: CateringForEmail) {
  const html = `
    <div style="font-family:-apple-system,Helvetica,Arial,sans-serif;max-width:600px;margin:auto;background:#0A0A0A;color:#F5F5DC;padding:24px;border-radius:12px">
      <h2 style="color:#D4AF37;margin:0 0 8px">🎉 New catering request · ${r.requestNumber}</h2>
      <p>From <strong>${r.customerName}</strong> (${r.email} · ${r.phone})</p>
      <table style="width:100%;border-collapse:collapse">
        <tr><td><strong>Event type</strong></td><td>${r.eventType}</td></tr>
        <tr><td><strong>Date</strong></td><td>${r.eventDate.toLocaleDateString()} · ${r.eventTime}</td></tr>
        <tr><td><strong>Guests</strong></td><td>${r.guestCount}</td></tr>
        <tr><td><strong>Style</strong></td><td>${r.serviceStyle}</td></tr>
        ${r.budgetRange ? `<tr><td><strong>Budget</strong></td><td>${r.budgetRange}</td></tr>` : ""}
      </table>
      ${r.menuRequests ? `<p style="background:#1A1A1A;padding:12px;border-radius:6px;margin-top:12px"><strong>Menu / dietary:</strong><br>${r.menuRequests}</p>` : ""}
      <p style="margin-top:20px;font-size:12px;color:#999">View in admin: <a href="https://${settings.website || "goseattlecatering.com"}/admin/catering" style="color:#D4AF37">Open dashboard</a></p>
    </div>`;
  return send(settings, `New catering request · ${r.requestNumber} · ${r.guestCount} guests`, html);
}

type ContactForEmail = {
  name: string;
  email: string;
  phone?: string | null;
  message: string;
};

export async function notifyNewContact(settings: SiteSettings, c: ContactForEmail) {
  const html = `
    <div style="font-family:-apple-system,Helvetica,Arial,sans-serif;max-width:600px;margin:auto;background:#0A0A0A;color:#F5F5DC;padding:24px;border-radius:12px">
      <h2 style="color:#D4AF37;margin:0 0 8px">📩 New contact message</h2>
      <p>From <strong>${c.name}</strong> (${c.email}${c.phone ? ` · ${c.phone}` : ""})</p>
      <div style="background:#1A1A1A;padding:16px;border-radius:6px;margin-top:12px;white-space:pre-wrap">${c.message}</div>
      <p style="margin-top:20px;font-size:12px;color:#999">View in admin: <a href="https://${settings.website || "goseattlecatering.com"}/admin/messages" style="color:#D4AF37">Open dashboard</a></p>
    </div>`;
  return send(settings, `New message from ${c.name}`, html);
}
