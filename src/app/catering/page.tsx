import { CateringForm } from "./CateringForm";
import Image from "next/image";
import { Heart, Sparkles, Users, Calendar, Cake, Award, ChefHat } from "lucide-react";
import { AnimateIn } from "@/components/AnimateIn";
import { maintenanceGate } from "@/lib/maintenance";
import { dict, interpolate } from "@/lib/i18n";
import { getLang } from "@/lib/i18n-server";

export const metadata = {
  title: "Catering — Gõ Seattle Catering",
};

export const revalidate = 0;

export default async function CateringPage() {
  const [s, lang] = await Promise.all([maintenanceGate(), getLang()]);
  const t = dict[lang];

  const HIGHLIGHTS = [
    { icon: Cake, label: t.cateringHighlight1 },
    { icon: Sparkles, label: t.cateringHighlight2 },
    { icon: Users, label: t.cateringHighlight3 },
    { icon: Heart, label: t.cateringHighlight4 },
  ];

  const STATS = [
    { icon: Users, value: `${s.cateringMinGuests} – ${s.cateringMaxGuests}+`, label: t.cateringStatGuests },
    { icon: Award, value: "100%", label: t.cateringStatAuthentic },
    { icon: ChefHat, value: t.cateringStatMenu, label: t.cateringStatMenu },
  ];
  return (
    <div>
      <section className="relative border-b border-gold-900/30 overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/images/food/banh-mi-tray.jpg"
            alt=""
            fill
            sizes="100vw"
            className="object-cover opacity-30"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-ink-900/85 via-ink-900/80 to-ink-900" />
          <div className="absolute inset-0 bg-gold-radial opacity-30" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <AnimateIn>
            <div className="text-center">
              <p className="eyebrow">{t.cateringEyebrow}</p>
              <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold mt-4">
                {t.cateringTitle} <span className="text-gold-gradient">{t.cateringTitleAccent}</span>
              </h1>
              <p className="mt-5 text-cream/80 max-w-2xl mx-auto">
                {interpolate(t.cateringSubtitle, { min: s.cateringMinGuests, max: s.cateringMaxGuests })}
              </p>
            </div>
          </AnimateIn>

          <AnimateIn delay={150}>
            <div className="mt-10 grid grid-cols-3 gap-3 sm:gap-6 max-w-2xl mx-auto">
              {STATS.map((st) => (
                <div key={st.label} className="text-center card p-4 sm:p-5">
                  <st.icon className="w-5 h-5 mx-auto text-gold-400" />
                  <p className="font-display text-xl sm:text-3xl font-bold text-gold-gradient mt-2">{st.value}</p>
                  <p className="text-[10px] sm:text-xs uppercase tracking-widest text-cream/60 mt-1">{st.label}</p>
                </div>
              ))}
            </div>
          </AnimateIn>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid lg:grid-cols-5 gap-10">
        <AnimateIn className="lg:col-span-2 space-y-4">
          <h2 className="font-display text-2xl font-bold text-gold-200">{t.cateringWhatYouGet}</h2>
          <ul className="space-y-3">
            {HIGHLIGHTS.map((h, i) => (
              <li
                key={h.label}
                className="flex items-start gap-3 p-4 card card-hover"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className="w-10 h-10 rounded-full bg-gold-gradient flex items-center justify-center text-ink-900 shrink-0">
                  <h.icon className="w-5 h-5" />
                </div>
                <span className="text-cream/85 pt-1.5">{h.label}</span>
              </li>
            ))}
          </ul>

          <div className="card p-5 mt-6 border-gold-500/40">
            <p className="text-sm text-cream/85">
              <Calendar className="w-4 h-4 inline mr-1 text-gold-400" />
              <strong className="text-gold-200">{t.cateringProTipLabel}</strong> {t.cateringProTip}
            </p>
          </div>
        </AnimateIn>

        <AnimateIn delay={100} className="lg:col-span-3">
          <div className="card p-6 lg:p-8 border-gold-500/30 shadow-gold">
            <h2 className="font-display text-2xl font-bold text-gold-200 mb-4">{t.cateringRequestTitle}</h2>
            <CateringForm
              minGuests={s.cateringMinGuests}
              maxGuests={s.cateringMaxGuests}
              t={t}
              lang={lang}
            />
          </div>
        </AnimateIn>
      </div>
    </div>
  );
}
