import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { formatUSD } from "@/lib/utils";
import { maintenanceGate } from "@/lib/maintenance";
import { AnimateIn } from "@/components/AnimateIn";
import {
  Heart,
  Sparkles,
  Utensils,
  Users,
  ChefHat,
  ArrowRight,
  Calendar,
  Briefcase,
  Cake,
  Phone,
  Star,
  Quote,
} from "lucide-react";

const SERVICES = [
  { icon: Cake, label: "Weddings", desc: "Full-service wedding catering with custom menu & tasting." },
  { icon: Sparkles, label: "Private Parties", desc: "Intimate gatherings, milestones, and celebrations." },
  { icon: Briefcase, label: "Corporate Events", desc: "Professional catering for offices and conferences." },
  { icon: Users, label: "Family Gatherings", desc: "Comfort food that brings everyone together." },
];

const VALUES = [
  { icon: Utensils, label: "Fresh & high-quality ingredients" },
  { icon: ChefHat, label: "Authentic Vietnamese flavors" },
  { icon: Sparkles, label: "Beautifully presented" },
  { icon: Heart, label: "Made with love & care" },
  { icon: Calendar, label: "Custom menus available" },
  { icon: Users, label: "Serving 10 – 500+ guests" },
];

export const revalidate = 0;

export default async function HomePage() {
  const settings = await maintenanceGate();
  const [featured, testimonials] = await Promise.all([
    prisma.menuItem.findMany({
      where: { isActive: true, isFeatured: true },
      include: { category: true },
      orderBy: { displayOrder: "asc" },
      take: 6,
    }),
    prisma.testimonial.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: "asc" },
      take: 6,
    }),
  ]);

  return (
    <>
      {/* ====== HERO ====== */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gold-radial opacity-70" />
        <div className="absolute -top-32 -left-32 w-[480px] h-[480px] rounded-full bg-gold-500/10 blur-3xl drift-slow" />
        <div className="absolute -bottom-32 -right-32 w-[520px] h-[520px] rounded-full bg-gold-700/10 blur-3xl drift-slow" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20 lg:pt-24 lg:pb-28 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <AnimateIn variant="fade">
              <p className="eyebrow flex items-center gap-2">
                <Star className="w-3.5 h-3.5 fill-gold-400 stroke-gold-400" />
                Vietnamese Catering · {settings.address || "Seattle, WA"}
              </p>
            </AnimateIn>
            <AnimateIn delay={100}>
              <h1 className="display-h1 text-5xl sm:text-6xl lg:text-7xl mt-5">
                <span className="text-gold-gradient">{settings.homeHeroLine1}</span>
                <br />
                <span className="text-cream">{settings.homeHeroLine2}</span>
                {settings.homeHeroLine3 && (
                  <>
                    <br />
                    <span className="text-cream">{settings.homeHeroLine3}</span>
                  </>
                )}
              </h1>
            </AnimateIn>
            <AnimateIn delay={200}>
              <p className="mt-6 text-lg text-cream/75 max-w-xl italic">
                {settings.homeHeroIntro}
              </p>
            </AnimateIn>
            <AnimateIn delay={300}>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/menu" className="btn-gold">
                  Order Online <ArrowRight className="w-4 h-4" />
                </Link>
                <Link href="/catering" className="btn-outline-gold">
                  Request Event Catering
                </Link>
              </div>
              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-cream/60">
                <span className="flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-gold-500" />
                  {settings.cateringMinGuests} – {settings.cateringMaxGuests}+ guests
                </span>
                <span className="flex items-center gap-1.5">
                  <Heart className="w-4 h-4 text-gold-500" /> Family recipes
                </span>
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-gold-500" /> Beautifully presented
                </span>
              </div>
            </AnimateIn>
          </div>

          {/* Hero collage */}
          <AnimateIn variant="scale" delay={150}>
            <div className="relative aspect-[5/6] sm:aspect-[6/7] lg:aspect-[5/6] max-w-lg mx-auto">
              <div className="absolute inset-0 gold-frame shadow-gold-lg">
                <Image
                  src="/images/food/banh-mi-tray.jpg"
                  alt="Vietnamese bánh mì catering tray"
                  fill
                  priority
                  sizes="(min-width: 1024px) 30vw, 80vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink-900/60 via-transparent to-transparent" />
              </div>

              <div className="absolute -left-6 sm:-left-10 bottom-10 w-40 sm:w-52 float-y">
                <div className="gold-frame shadow-gold-lg aspect-[4/5]">
                  <Image
                    src="/images/food/spring-rolls.jpg"
                    alt="Fresh spring rolls"
                    fill
                    sizes="220px"
                    className="object-cover"
                  />
                </div>
                <p className="mt-2 text-center text-xs uppercase tracking-widest text-gold-300">
                  Gỏi Cuốn · $7.85
                </p>
              </div>

              <div className="absolute -right-4 sm:-right-8 top-4 w-28 sm:w-36 float-y" style={{ animationDelay: "1.5s" }}>
                <div className="gold-frame shadow-gold-lg aspect-[3/4]">
                  <Image
                    src="/images/food/ca-phe.jpg"
                    alt="Vietnamese iced coffee"
                    fill
                    sizes="160px"
                    className="object-cover"
                  />
                </div>
                <p className="mt-2 text-center text-xs uppercase tracking-widest text-gold-300">
                  Cà Phê · $7.00
                </p>
              </div>
            </div>
          </AnimateIn>
        </div>

        <div className="hidden lg:flex flex-col items-center text-gold-500/50 pb-6 absolute bottom-0 left-1/2 -translate-x-1/2 text-[10px] tracking-[0.4em] uppercase">
          <span>scroll</span>
          <div className="w-px h-8 bg-gradient-to-b from-gold-500/40 to-transparent mt-2" />
        </div>
      </section>

      {/* ====== SERVICES ====== */}
      <section className="py-20 lg:py-28 border-t border-gold-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimateIn>
            <div className="text-center mb-14">
              <p className="eyebrow">What we cater</p>
              <h2 className="font-display text-4xl sm:text-5xl font-bold mt-3">
                For every <span className="text-gold-gradient">special moment</span>
              </h2>
            </div>
          </AnimateIn>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {SERVICES.map((s, i) => (
              <AnimateIn key={s.label} delay={i * 80}>
                <div className="card card-hover p-6 h-full group">
                  <div className="w-12 h-12 rounded-full bg-gold-gradient flex items-center justify-center text-ink-900 mb-4 transition-transform group-hover:rotate-6 group-hover:scale-110">
                    <s.icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-display font-bold text-lg text-gold-200">{s.label}</h3>
                  <p className="text-sm text-cream/65 mt-2">{s.desc}</p>
                </div>
              </AnimateIn>
            ))}
          </div>
        </div>
      </section>

      {/* ====== FEATURED MENU ====== */}
      {featured.length > 0 && (
        <section className="py-20 lg:py-28 border-t border-gold-900/30 bg-ink-950/40 relative">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold-500/40 to-transparent" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <AnimateIn>
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
                <div>
                  <p className="eyebrow">Featured</p>
                  <h2 className="font-display text-4xl sm:text-5xl font-bold mt-3">
                    Customer <span className="text-gold-gradient">favorites</span>
                  </h2>
                </div>
                <Link href="/menu" className="text-gold-300 hover:text-gold-200 text-sm font-semibold inline-flex items-center gap-1 group">
                  View full menu <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </AnimateIn>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {featured.map((m, i) => (
                <AnimateIn key={m.id} delay={i * 70}>
                  <Link href="/menu" className="card card-hover overflow-hidden group block">
                    {m.image && (
                      <div className="aspect-[16/10] overflow-hidden bg-ink-950 relative">
                        <Image
                          src={m.image}
                          alt={m.nameEn}
                          fill
                          sizes="(min-width: 1024px) 25vw, 100vw"
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>
                    )}
                    <div className="p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-xs text-gold-500/80 font-mono mb-1">{m.code}</p>
                          <h3 className="font-display font-bold text-xl text-cream">{m.nameEn}</h3>
                          {m.nameVn && <p className="text-sm text-gold-300/70 italic">{m.nameVn}</p>}
                        </div>
                        <span className="text-gold-300 font-display font-bold">{formatUSD(m.basePrice)}</span>
                      </div>
                      <p className="text-xs text-cream/55 mt-3">{m.category.nameEn}</p>
                    </div>
                  </Link>
                </AnimateIn>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ====== WHY US ====== */}
      <section className="py-20 lg:py-28 border-t border-gold-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimateIn>
            <div className="text-center mb-12">
              <p className="eyebrow">Why Gõ Seattle</p>
              <h2 className="font-display text-4xl sm:text-5xl font-bold mt-3">
                <span className="text-gold-gradient">Fresh · Authentic · Made with love</span>
              </h2>
            </div>
          </AnimateIn>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {VALUES.map((v, i) => (
              <AnimateIn key={v.label} delay={i * 50}>
                <div className="flex items-center gap-3 p-5 card card-hover h-full">
                  <div className="w-10 h-10 rounded-full bg-gold-500/15 border border-gold-500/40 flex items-center justify-center text-gold-300 shrink-0">
                    <v.icon className="w-5 h-5" />
                  </div>
                  <span className="text-sm sm:text-base text-cream/85">{v.label}</span>
                </div>
              </AnimateIn>
            ))}
          </div>
        </div>
      </section>

      {/* ====== TESTIMONIALS ====== */}
      {testimonials.length > 0 && (
        <section className="py-20 lg:py-28 border-t border-gold-900/30 bg-ink-950/40">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <AnimateIn>
              <div className="text-center mb-12">
                <p className="eyebrow">What guests say</p>
                <h2 className="font-display text-4xl sm:text-5xl font-bold mt-3">
                  Trusted by <span className="text-gold-gradient">Seattle</span>
                </h2>
              </div>
            </AnimateIn>
            <div className="grid md:grid-cols-3 gap-5">
              {testimonials.map((t, i) => (
                <AnimateIn key={t.id} delay={i * 100}>
                  <div className="card p-6 h-full relative">
                    <Quote className="w-7 h-7 text-gold-500/30 absolute top-4 right-4" />
                    <div className="flex gap-0.5 mb-3">
                      {Array.from({ length: Math.max(1, Math.min(5, t.rating)) }).map((_, idx) => (
                        <Star key={idx} className="w-4 h-4 fill-gold-400 stroke-gold-400" />
                      ))}
                    </div>
                    <p className="text-cream/85 text-sm leading-relaxed">{t.text}</p>
                    <div className="divider-gold my-4" />
                    <p className="text-sm font-semibold text-gold-200">{t.name}</p>
                    <p className="text-xs text-cream/55">{t.role}</p>
                  </div>
                </AnimateIn>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ====== CTA ====== */}
      <section className="py-24 border-t border-gold-900/30 relative overflow-hidden">
        <div className="absolute inset-0 bg-gold-radial opacity-50" />
        <AnimateIn>
          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold">
              Let us <span className="text-gold-gradient">cater your next event</span>
            </h2>
            <p className="mt-5 text-cream/70 max-w-xl mx-auto text-balance">
              Delicious food · Memorable moments. From {settings.cateringMinGuests} to {settings.cateringMaxGuests}+ guests, we&apos;ll craft a custom Vietnamese menu for your celebration.
            </p>
            <div className="mt-9 flex flex-wrap justify-center gap-3">
              <Link href="/catering" className="btn-gold">
                Request a Quote <ArrowRight className="w-4 h-4" />
              </Link>
              {settings.phone && (
                <a href={`tel:${settings.phone}`} className="btn-outline-gold">
                  <Phone className="w-4 h-4" /> Call {settings.phone}
                </a>
              )}
            </div>
          </div>
        </AnimateIn>
      </section>
    </>
  );
}
