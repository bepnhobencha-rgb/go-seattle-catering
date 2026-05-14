import Link from "next/link";
import { getSettings } from "@/lib/settings";
import { Globe, Mail, MapPin, Phone, ExternalLink } from "lucide-react";
import { dict } from "@/lib/i18n";
import { getLang } from "@/lib/i18n-server";

export async function Footer() {
  const [s, lang] = await Promise.all([getSettings(), getLang()]);
  const t = dict[lang];

  return (
    <footer className="mt-24 border-t border-gold-900/40 bg-ink-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 grid grid-cols-1 md:grid-cols-4 gap-10">
        <div className="md:col-span-2">
          <h3 className="font-display text-2xl text-gold-gradient font-bold">{s.name}</h3>
          {s.sloganEn && <p className="mt-2 italic text-cream/70 text-sm">{s.sloganEn}</p>}
          {s.sloganVn && <p className="mt-1 italic text-gold-300/80 text-sm">{s.sloganVn}</p>}
          <p className="mt-6 text-cream/60 text-sm max-w-md">{t.footerDescription}</p>
        </div>

        <div>
          <h4 className="text-gold-300 text-sm font-bold tracking-widest uppercase mb-4">{t.footerVisit}</h4>
          <ul className="space-y-3 text-sm text-cream/70">
            {s.address && (
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-gold-500 mt-0.5 shrink-0" />
                {s.address}
              </li>
            )}
            {s.phone && (
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-gold-500 shrink-0" />
                <a href={`tel:${s.phone}`} className="hover:text-gold-300">{s.phone}</a>
              </li>
            )}
            {s.email && (
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-gold-500 shrink-0" />
                <a href={`mailto:${s.email}`} className="hover:text-gold-300">{s.email}</a>
              </li>
            )}
            {s.website && (
              <li className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-gold-500 shrink-0" />
                <span>{s.website}</span>
              </li>
            )}
            {s.facebook && (
              <li className="flex items-center gap-2">
                <ExternalLink className="w-4 h-4 text-gold-500 shrink-0" />
                <a href={s.facebook} target="_blank" rel="noopener" className="hover:text-gold-300">
                  Facebook
                </a>
              </li>
            )}
          </ul>
        </div>

        <div>
          <h4 className="text-gold-300 text-sm font-bold tracking-widest uppercase mb-4">{t.footerHours}</h4>
          <ul className="space-y-1.5 text-sm text-cream/70">
            {s.hours.map((h) => (
              <li key={h.day} className="flex justify-between gap-3">
                <span className="text-gold-200/80 font-medium w-10">{h.day}</span>
                <span>{h.hours}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-gold-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-cream/50">
          <p>© {new Date().getFullYear()} {s.name}. {t.footerRights}</p>
          <div className="flex gap-4">
            <Link href="/menu" className="hover:text-gold-300">{t.navMenu}</Link>
            <Link href="/catering" className="hover:text-gold-300">{t.navCatering}</Link>
            <Link href="/account" className="hover:text-gold-300">{t.navAccount}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
