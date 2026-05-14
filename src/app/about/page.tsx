import Image from "next/image";
import Link from "next/link";
import { Heart, ChefHat, Sparkles, Award, ArrowRight } from "lucide-react";
import { AnimateIn } from "@/components/AnimateIn";
import { maintenanceGate } from "@/lib/maintenance";
import { dict } from "@/lib/i18n";
import { getLang } from "@/lib/i18n-server";

export const metadata = {
  title: "About — Gõ Seattle Catering",
};

export const revalidate = 0;

export default async function AboutPage() {
  const [s, lang] = await Promise.all([maintenanceGate(), getLang()]);
  const t = dict[lang];
  const paragraphs = s.aboutStory.split(/\n\s*\n/).filter(Boolean);
  const VALUES = [
    { icon: Heart, title: t.aboutValueLove, desc: t.aboutValueLoveDesc },
    { icon: ChefHat, title: t.aboutValueAuthentic, desc: t.aboutValueAuthenticDesc },
    { icon: Sparkles, title: t.aboutValuePresented, desc: t.aboutValuePresentedDesc },
    { icon: Award, title: t.aboutValueTrusted, desc: t.aboutValueTrustedDesc },
  ];
  return (
    <div className="relative">
      <div className="absolute inset-x-0 top-0 h-[500px] bg-gold-radial opacity-40 pointer-events-none" />
      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <AnimateIn>
          <div className="text-center">
            <p className="eyebrow">{t.aboutEyebrow}</p>
            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold mt-4">
              <span className="text-gold-gradient">{s.sloganEn}</span>
            </h1>
            <p className="mt-3 italic text-gold-300/80">{s.sloganVn}</p>
          </div>
        </AnimateIn>

        <div className="mt-14 grid lg:grid-cols-2 gap-12 items-center">
          <AnimateIn variant="scale">
            <div className="relative aspect-[5/6] max-w-md mx-auto">
              <div className="absolute -inset-3 bg-gold-gradient opacity-15 blur-2xl rounded-3xl" />
              <div className="absolute inset-0 gold-frame shadow-gold-lg">
                <Image
                  src="/images/food/pho.jpg"
                  alt="Phở Vietnamese noodle soup"
                  fill
                  sizes="(min-width: 1024px) 30vw, 90vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink-900/50 to-transparent" />
              </div>
              {/* Floating accent */}
              <div className="absolute -right-4 -bottom-4 w-32 sm:w-44 float-y">
                <div className="gold-frame shadow-gold-lg aspect-[4/5]">
                  <Image
                    src="/images/food/spring-rolls.jpg"
                    alt="Fresh spring rolls"
                    fill
                    sizes="200px"
                    className="object-cover"
                  />
                </div>
              </div>
            </div>
          </AnimateIn>

          <AnimateIn delay={100}>
            <div className="space-y-4 text-cream/80 leading-relaxed">
              {paragraphs.map((p, idx) => (
                <p key={idx}>{p}</p>
              ))}
            </div>
          </AnimateIn>
        </div>

        <div className="mt-24 grid grid-cols-1 sm:grid-cols-2 gap-5">
          {VALUES.map((v, i) => (
            <AnimateIn key={v.title} delay={i * 80}>
              <div className="card card-hover p-6 h-full">
                <div className="w-12 h-12 rounded-full bg-gold-gradient flex items-center justify-center text-ink-900 mb-4">
                  <v.icon className="w-6 h-6" />
                </div>
                <h3 className="font-display font-bold text-xl text-gold-200">{v.title}</h3>
                <p className="text-sm text-cream/65 mt-2">{v.desc}</p>
              </div>
            </AnimateIn>
          ))}
        </div>

        <AnimateIn>
          <div className="mt-24 text-center">
            <Link href="/catering" className="btn-gold">
              {t.aboutBookEvent} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </AnimateIn>
      </div>
    </div>
  );
}
