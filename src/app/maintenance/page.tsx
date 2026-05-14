import { getSettings } from "@/lib/settings";
import Image from "next/image";
import Link from "next/link";
import { Phone, Mail, MapPin, Sparkles, Clock } from "lucide-react";

export const metadata = {
  title: "Coming Soon — Gõ Seattle Catering",
  description: "We're crafting something special. Be back soon.",
};

export const revalidate = 0;

export default async function MaintenancePage() {
  const s = await getSettings();
  return (
    <main className="min-h-screen bg-ink-900 text-cream flex flex-col">
      {/* Ambient gold glows */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gold-radial opacity-70" />
        <div className="absolute -top-40 -left-40 w-[520px] h-[520px] rounded-full bg-gold-500/10 blur-3xl drift-slow" />
        <div className="absolute -bottom-40 -right-40 w-[560px] h-[560px] rounded-full bg-gold-700/10 blur-3xl drift-slow" />
        <div className="film-grain" />
      </div>

      <div className="relative flex-1 flex flex-col">
        {/* Top brand bar */}
        <div className="px-6 sm:px-12 py-6">
          <Link href="/maintenance" className="inline-flex items-center gap-3 group">
            <Image
              src={s.logo}
              alt={s.name}
              width={56}
              height={56}
              priority
              className="rounded-md shadow-gold object-contain bg-ink-900 transition-transform group-hover:scale-105"
            />
            <div className="hidden sm:flex flex-col leading-tight">
              <span className="font-display text-xl text-gold-gradient font-bold tracking-wide">
                {s.name.split(/\s+/).slice(0, 2).join(" ")}
              </span>
              <span className="text-[10px] uppercase tracking-[0.35em] text-gold-700">
                Catering
              </span>
            </div>
          </Link>
        </div>

        {/* Centre */}
        <section className="flex-1 flex items-center justify-center px-6 sm:px-12 pb-12">
          <div className="max-w-3xl text-center">
            <p className="eyebrow inline-flex items-center gap-2 justify-center">
              <Sparkles className="w-3.5 h-3.5 text-gold-400" />
              Coming Soon
            </p>

            <h1 className="font-display font-bold mt-6 text-5xl sm:text-6xl lg:text-7xl leading-[1.05]">
              <span className="text-gold-gradient">{s.maintenanceTitle}</span>
            </h1>

            {s.sloganVn && (
              <p className="mt-4 italic text-gold-300/80 text-base sm:text-lg">{s.sloganVn}</p>
            )}

            <p className="mt-8 text-cream/75 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed text-balance">
              {s.maintenanceMessage}
            </p>

            {/* Decorative divider */}
            <div className="mt-12 flex items-center justify-center gap-4">
              <div className="h-px w-16 sm:w-24 bg-gradient-to-r from-transparent to-gold-500/60" />
              <span className="text-gold-500 text-xs tracking-[0.4em] uppercase">Hương Vị Việt</span>
              <div className="h-px w-16 sm:w-24 bg-gradient-to-l from-transparent to-gold-500/60" />
            </div>

            {/* Contact card */}
            <div className="mt-12 card p-6 sm:p-8 border-gold-500/30 shadow-gold-lg max-w-xl mx-auto bg-ink-800/70">
              <p className="eyebrow mb-4">Get in touch</p>
              <div className="grid sm:grid-cols-2 gap-4 text-sm">
                {s.phone && (
                  <a
                    href={`tel:${s.phone}`}
                    className="flex items-center gap-3 p-3 rounded-md border border-gold-900/40 hover:border-gold-500/50 hover:bg-gold-500/5 transition-all group"
                  >
                    <Phone className="w-5 h-5 text-gold-400 group-hover:scale-110 transition-transform" />
                    <div className="text-left">
                      <p className="text-[10px] uppercase tracking-widest text-gold-500/80">Phone</p>
                      <p className="text-cream font-medium">{s.phone}</p>
                    </div>
                  </a>
                )}
                {s.email && (
                  <a
                    href={`mailto:${s.email}`}
                    className="flex items-center gap-3 p-3 rounded-md border border-gold-900/40 hover:border-gold-500/50 hover:bg-gold-500/5 transition-all group"
                  >
                    <Mail className="w-5 h-5 text-gold-400 group-hover:scale-110 transition-transform" />
                    <div className="text-left">
                      <p className="text-[10px] uppercase tracking-widest text-gold-500/80">Email</p>
                      <p className="text-cream font-medium truncate">{s.email}</p>
                    </div>
                  </a>
                )}
                {s.address && (
                  <div className="flex items-center gap-3 p-3 rounded-md border border-gold-900/40 sm:col-span-2">
                    <MapPin className="w-5 h-5 text-gold-400" />
                    <div className="text-left">
                      <p className="text-[10px] uppercase tracking-widest text-gold-500/80">Location</p>
                      <p className="text-cream font-medium">{s.address}</p>
                    </div>
                  </div>
                )}
              </div>

              {s.hours.length > 0 && (
                <details className="mt-5 group">
                  <summary className="cursor-pointer list-none flex items-center justify-center gap-2 text-xs uppercase tracking-widest text-gold-400 hover:text-gold-300">
                    <Clock className="w-3.5 h-3.5" />
                    Hours
                    <span className="text-cream/40 group-open:rotate-180 transition-transform">▾</span>
                  </summary>
                  <ul className="mt-3 grid grid-cols-2 gap-x-6 gap-y-1 text-xs text-cream/75">
                    {s.hours.map((h) => (
                      <li key={h.day} className="flex justify-between">
                        <span className="text-gold-200/80">{h.day}</span>
                        <span>{h.hours}</span>
                      </li>
                    ))}
                  </ul>
                </details>
              )}
            </div>

            {s.facebook && (
              <a
                href={s.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-8 text-xs uppercase tracking-[0.3em] text-gold-300 hover:text-gold-200"
              >
                Follow us on Facebook →
              </a>
            )}
          </div>
        </section>

        {/* Bottom footer */}
        <footer className="px-6 sm:px-12 py-8 border-t border-gold-900/30 bg-ink-950/70 backdrop-blur-sm">
          <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-cream/50">
              © {new Date().getFullYear()} {s.name}. All rights reserved.
            </p>
            <p className="text-xs italic text-gold-500/70">{s.sloganEn}</p>
          </div>
        </footer>
      </div>
    </main>
  );
}
