import { maintenanceGate } from "@/lib/maintenance";
import { Globe, Mail, MapPin, Phone, Clock, ExternalLink } from "lucide-react";
import { ContactForm } from "./ContactForm";
import { AnimateIn } from "@/components/AnimateIn";
import { dict } from "@/lib/i18n";
import { getLang } from "@/lib/i18n-server";

export const metadata = {
  title: "Contact us — Phone, email, hours, address",
  description:
    "Get in touch with Gõ Seattle Catering. Phone, email, address, hours, Facebook. Questions about an order or planning a special event? We'd love to hear from you.",
};

export default async function ContactPage() {
  const [s, lang] = await Promise.all([maintenanceGate(), getLang()]);
  const t = dict[lang];
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
      <AnimateIn>
        <div className="text-center mb-12">
          <p className="eyebrow">{t.contactEyebrow}</p>
          <h1 className="font-display text-5xl sm:text-6xl font-bold mt-3">
            {t.contactTitle} <span className="text-gold-gradient">{t.contactTitleAccent}</span> {t.contactTitleEnd}
          </h1>
          <p className="mt-4 text-cream/70 max-w-2xl mx-auto">{t.contactSubtitle}</p>
        </div>
      </AnimateIn>

      <div className="grid lg:grid-cols-2 gap-10">
        <AnimateIn className="space-y-5">
          <div className="card p-6">
            <h2 className="font-display text-xl font-bold text-gold-200 mb-4">{t.contactVisitUs}</h2>
            <ul className="space-y-3 text-cream/80 text-sm">
              {s.address && (
                <li className="flex gap-3">
                  <MapPin className="w-5 h-5 text-gold-400 shrink-0 mt-0.5" />
                  <span>{s.address}</span>
                </li>
              )}
              {s.phone && (
                <li className="flex gap-3">
                  <Phone className="w-5 h-5 text-gold-400 shrink-0 mt-0.5" />
                  <a href={`tel:${s.phone}`} className="hover:text-gold-300">{s.phone}</a>
                </li>
              )}
              {s.email && (
                <li className="flex gap-3">
                  <Mail className="w-5 h-5 text-gold-400 shrink-0 mt-0.5" />
                  <a href={`mailto:${s.email}`} className="hover:text-gold-300">{s.email}</a>
                </li>
              )}
              {s.website && (
                <li className="flex gap-3">
                  <Globe className="w-5 h-5 text-gold-400 shrink-0 mt-0.5" />
                  <span>{s.website}</span>
                </li>
              )}
              {s.facebook && (
                <li className="flex gap-3">
                  <ExternalLink className="w-5 h-5 text-gold-400 shrink-0 mt-0.5" />
                  <a href={s.facebook} target="_blank" rel="noopener" className="hover:text-gold-300">
                    Facebook
                  </a>
                </li>
              )}
            </ul>
          </div>

          <div className="card p-6">
            <h2 className="font-display text-xl font-bold text-gold-200 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5" /> {t.contactHours}
            </h2>
            <ul className="space-y-2 text-sm">
              {s.hours.map((h) => (
                <li key={h.day} className="flex justify-between text-cream/80">
                  <span className="font-semibold text-gold-200 w-12">{h.day}</span>
                  <span>{h.hours}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="card overflow-hidden gold-frame">
            <iframe
              src={s.mapEmbedUrl || `https://www.google.com/maps?q=${encodeURIComponent(s.address || "Seattle, WA")}&output=embed`}
              width="100%"
              height="280"
              style={{ border: 0, filter: "grayscale(0.4) brightness(0.85)" }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </AnimateIn>

        <AnimateIn delay={100}>
          <div className="card p-6 lg:p-8 border-gold-500/30">
            <h2 className="font-display text-xl font-bold text-gold-200 mb-4">{t.contactSendMessage}</h2>
            <ContactForm t={t} />
          </div>
        </AnimateIn>
      </div>
    </div>
  );
}
