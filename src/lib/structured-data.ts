import type { SiteSettings } from "./settings";

type Day = "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";

const DAY_MAP: Record<string, string> = {
  Mon: "Monday",
  Tue: "Tuesday",
  Wed: "Wednesday",
  Thu: "Thursday",
  Fri: "Friday",
  Sat: "Saturday",
  Sun: "Sunday",
};

function parseHours(text: string): { open: string; close: string } | null {
  // Match "10:00 AM – 8:00 PM" or "Closed"
  if (/closed/i.test(text)) return null;
  const m = text.match(/(\d{1,2}):?(\d{2})?\s*(AM|PM)\s*[–-]\s*(\d{1,2}):?(\d{2})?\s*(AM|PM)/i);
  if (!m) return null;
  const to24 = (h: string, mm: string | undefined, ap: string) => {
    let H = parseInt(h, 10);
    const M = mm ? parseInt(mm, 10) : 0;
    if (/PM/i.test(ap) && H !== 12) H += 12;
    if (/AM/i.test(ap) && H === 12) H = 0;
    return `${String(H).padStart(2, "0")}:${String(M).padStart(2, "0")}`;
  };
  return { open: to24(m[1], m[2], m[3]), close: to24(m[4], m[5], m[6]) };
}

/**
 * JSON-LD for a Vietnamese restaurant / catering service.
 * Embed inside <script type="application/ld+json">.
 */
export function restaurantSchema(s: SiteSettings, siteUrl: string) {
  const hoursSpec = s.hours
    .map((h) => {
      const parsed = parseHours(h.hours);
      if (!parsed) return null;
      return {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: DAY_MAP[h.day as Day] ?? h.day,
        opens: parsed.open,
        closes: parsed.close,
      };
    })
    .filter(Boolean);

  return {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    "@id": `${siteUrl}#restaurant`,
    name: s.name,
    description: s.sloganEn,
    url: siteUrl,
    image: [`${siteUrl}${s.logo}`, `${siteUrl}/images/food/banh-mi-tray.jpg`],
    logo: `${siteUrl}${s.logo}`,
    telephone: s.phone || undefined,
    email: s.email || undefined,
    servesCuisine: "Vietnamese",
    priceRange: "$$",
    address: s.address
      ? {
          "@type": "PostalAddress",
          streetAddress: s.address,
          addressLocality: "Seattle",
          addressRegion: "WA",
          addressCountry: "US",
        }
      : undefined,
    openingHoursSpecification: hoursSpec.length ? hoursSpec : undefined,
    sameAs: s.facebook ? [s.facebook] : undefined,
    acceptsReservations: true,
  };
}

type CategoryWithItems = {
  nameEn: string;
  nameVn: string;
  items: Array<{
    nameEn: string;
    nameVn?: string | null;
    description?: string | null;
    basePrice: number;
    image?: string | null;
  }>;
};

/** Menu schema for menu page — gives Google rich snippets. */
export function menuSchema(siteUrl: string, categories: CategoryWithItems[]) {
  return {
    "@context": "https://schema.org",
    "@type": "Menu",
    name: "Menu",
    hasMenuSection: categories.map((cat) => ({
      "@type": "MenuSection",
      name: cat.nameEn,
      alternateName: cat.nameVn,
      hasMenuItem: cat.items.map((it) => ({
        "@type": "MenuItem",
        name: it.nameEn,
        alternateName: it.nameVn || undefined,
        description: it.description || undefined,
        image: it.image ? (it.image.startsWith("http") ? it.image : `${siteUrl}${it.image}`) : undefined,
        offers: {
          "@type": "Offer",
          price: it.basePrice.toFixed(2),
          priceCurrency: "USD",
        },
      })),
    })),
  };
}
