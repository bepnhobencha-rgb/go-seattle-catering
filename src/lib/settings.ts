import { prisma } from "@/lib/prisma";
import { cache } from "react";
import { unstable_cache } from "next/cache";

export type Hour = { day: string; hours: string };

export type SiteSettings = {
  // Brand
  name: string;
  sloganEn: string;
  sloganVn: string;
  logo: string;

  // Contact
  phone: string;
  email: string;
  address: string;
  website: string;
  facebook: string;
  hours: Hour[];
  mapEmbedUrl: string;

  // Content
  homeHeroLine1: string;
  homeHeroLine2: string;
  homeHeroLine3: string;
  homeHeroIntro: string;
  aboutStory: string;

  // Vietnamese versions
  homeHeroLine1Vn: string;
  homeHeroLine2Vn: string;
  homeHeroLine3Vn: string;
  homeHeroIntroVn: string;
  aboutStoryVn: string;

  // Hero images
  heroMainImage: string;
  heroFloat1Image: string;
  heroFloat1Label: string;
  heroFloat2Image: string;
  heroFloat2Label: string;

  // Operations
  taxRate: number;
  taxLabel: string;
  currency: string;
  minPickupMinutes: number;
  maxPickupDays: number;
  cateringMinGuests: number;
  cateringMaxGuests: number;

  // Maintenance
  maintenanceMode: boolean;
  maintenanceTitle: string;
  maintenanceMessage: string;
  maintenanceTitleVn: string;
  maintenanceMessageVn: string;

  // Email (Resend)
  resendApiKey: string;
  notifyEmail: string;

  // Stripe
  stripeEnabled: boolean;
  stripeMode: "test" | "live";
  stripePublishableKey: string;
  stripeSecretKey: string;
  stripeWebhookSecret: string;
};

const DEFAULT_HOURS: Hour[] = [
  { day: "Mon", hours: "10:00 AM – 8:00 PM" },
  { day: "Tue", hours: "10:00 AM – 8:00 PM" },
  { day: "Wed", hours: "10:00 AM – 8:00 PM" },
  { day: "Thu", hours: "10:00 AM – 8:00 PM" },
  { day: "Fri", hours: "10:00 AM – 9:00 PM" },
  { day: "Sat", hours: "10:00 AM – 9:00 PM" },
  { day: "Sun", hours: "11:00 AM – 7:00 PM" },
];

export const SITE_DEFAULTS: SiteSettings = {
  name: "Gõ Seattle Catering",
  sloganEn: "Cooking with love provides food for the soul",
  sloganVn: "Hương Vị Việt — Taste of Vietnam",
  logo: "/images/logos/logo-dark.jpg",
  phone: "(206) 555-0100",
  email: "hello@goseattlecatering.com",
  address: "Seattle, WA",
  website: "goseattlecatering.com",
  facebook: "https://facebook.com/Gõ-Seattle-Catering",
  hours: DEFAULT_HOURS,
  mapEmbedUrl: "",

  homeHeroLine1: "Cooking with love",
  homeHeroLine2: "provides food",
  homeHeroLine3: "for the soul",
  homeHeroIntro: "Hương Vị Việt — bringing the authentic taste of Vietnam to your table with love and care.",
  aboutStory:
    "Gõ Seattle Catering was born from a simple belief: food cooked with love feeds the soul. We bring the rich, vibrant flavors of Vietnam — from the bustling street food of Saigon to the comforting family meals of the Mekong Delta — to tables all across Seattle.\n\nWhether you're planning an unforgettable wedding, a corporate luncheon, a private celebration, or a Sunday family gathering, our team crafts custom Vietnamese menus that honor tradition and delight every guest. We serve parties from 10 to 500+.\n\nEvery spring roll is hand-rolled. Every bowl of phở begins with a broth that simmers for hours. Every detail of presentation reflects our pride in our heritage and our commitment to your special day.",

  homeHeroLine1Vn: "Nấu bằng cả tấm lòng",
  homeHeroLine2Vn: "là món ăn",
  homeHeroLine3Vn: "dành cho tâm hồn",
  homeHeroIntroVn: "Hương Vị Việt — mang hương vị Việt Nam đến bàn tiệc của bạn với tất cả sự yêu thương và chăm chút.",
  aboutStoryVn:
    "Gõ Seattle Catering được sinh ra từ một niềm tin giản dị: món ăn được nấu bằng cả tấm lòng nuôi dưỡng tâm hồn. Chúng tôi mang hương vị Việt phong phú, đậm đà — từ ẩm thực đường phố sôi động của Sài Gòn đến những bữa cơm gia đình ấm cúng của miền Tây — đến bàn tiệc khắp Seattle.\n\nDù bạn đang chuẩn bị một đám cưới đáng nhớ, một buổi tiệc văn phòng, một lễ kỷ niệm thân mật, hay một buổi họp mặt gia đình cuối tuần — đội ngũ chúng tôi soạn menu Việt riêng cho từng sự kiện, tôn vinh truyền thống và làm hài lòng mọi thực khách. Chúng tôi phục vụ từ 10 đến 500+ khách.\n\nMỗi cuốn gỏi cuốn được cuốn tay. Mỗi tô phở bắt đầu từ nồi nước dùng ninh hàng giờ. Mỗi chi tiết trình bày đều thể hiện niềm tự hào về di sản và sự cam kết của chúng tôi với ngày đặc biệt của bạn.",
  heroMainImage: "/images/food/banh-mi-tray.jpg",
  heroFloat1Image: "/images/food/spring-rolls.jpg",
  heroFloat1Label: "Gỏi Cuốn · $7.85",
  heroFloat2Image: "/images/food/ca-phe.jpg",
  heroFloat2Label: "Cà Phê · $7.00",

  taxRate: 0.1025,
  taxLabel: "WA Sales Tax",
  currency: "USD",
  minPickupMinutes: 30,
  maxPickupDays: 7,
  cateringMinGuests: 10,
  cateringMaxGuests: 1000,

  maintenanceMode: false,
  maintenanceTitle: "We're crafting something special",
  maintenanceMessage:
    "Our website is currently being prepared. We'll be ready to welcome you very soon. In the meantime, feel free to reach out for catering inquiries.",
  maintenanceTitleVn: "Chúng tôi đang chuẩn bị điều đặc biệt",
  maintenanceMessageVn:
    "Website đang trong giai đoạn hoàn thiện. Chúng tôi sẽ sẵn sàng đón tiếp bạn rất sớm. Trong thời gian này, vui lòng liên hệ trực tiếp cho mọi yêu cầu đặt tiệc.",

  resendApiKey: "",
  notifyEmail: "",

  stripeEnabled: false,
  stripeMode: "test",
  stripePublishableKey: "",
  stripeSecretKey: "",
  stripeWebhookSecret: "",
};

function parseHours(raw: string): Hour[] {
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed.filter((h) => h && typeof h.day === "string");
  } catch {}
  return DEFAULT_HOURS;
}

/**
 * Cross-request cache (60 s). Invalidated explicitly by admin save via
 * `revalidateTag("settings")` so changes propagate immediately while public
 * pages don't hit the DB on every visit.
 */
const fetchSettingsRow = unstable_cache(
  async () => {
    let row = await prisma.settings.findUnique({ where: { id: "default" } });
    if (!row) {
      row = await prisma.settings.create({
        data: {
          id: "default",
          name: SITE_DEFAULTS.name,
          sloganEn: SITE_DEFAULTS.sloganEn,
          sloganVn: SITE_DEFAULTS.sloganVn,
          phone: SITE_DEFAULTS.phone,
          email: SITE_DEFAULTS.email,
          address: SITE_DEFAULTS.address,
          website: SITE_DEFAULTS.website,
          facebook: SITE_DEFAULTS.facebook,
          hours: JSON.stringify(SITE_DEFAULTS.hours),
          aboutStory: SITE_DEFAULTS.aboutStory,
        },
      });
    }
    return row;
  },
  ["settings"],
  { tags: ["settings"], revalidate: 60 }
);

/**
 * `cache()` from React dedupes within a single request render — so the layout,
 * page, footer, etc. share one DB roundtrip per request.
 */
export const getSettings = cache(async (): Promise<SiteSettings> => {
  const row = await fetchSettingsRow();
  return {
    name: row.name,
    sloganEn: row.sloganEn,
    sloganVn: row.sloganVn,
    logo: row.logo || SITE_DEFAULTS.logo,
    phone: row.phone,
    email: row.email,
    address: row.address,
    website: row.website,
    facebook: row.facebook,
    hours: parseHours(row.hours),
    mapEmbedUrl: row.mapEmbedUrl,

    homeHeroLine1: row.homeHeroLine1,
    homeHeroLine2: row.homeHeroLine2,
    homeHeroLine3: row.homeHeroLine3,
    homeHeroIntro: row.homeHeroIntro,
    aboutStory: row.aboutStory,
    homeHeroLine1Vn: row.homeHeroLine1Vn || SITE_DEFAULTS.homeHeroLine1Vn,
    homeHeroLine2Vn: row.homeHeroLine2Vn || SITE_DEFAULTS.homeHeroLine2Vn,
    homeHeroLine3Vn: row.homeHeroLine3Vn || SITE_DEFAULTS.homeHeroLine3Vn,
    homeHeroIntroVn: row.homeHeroIntroVn || SITE_DEFAULTS.homeHeroIntroVn,
    aboutStoryVn: row.aboutStoryVn || SITE_DEFAULTS.aboutStoryVn,

    heroMainImage: row.heroMainImage || SITE_DEFAULTS.heroMainImage,
    heroFloat1Image: row.heroFloat1Image || SITE_DEFAULTS.heroFloat1Image,
    heroFloat1Label: row.heroFloat1Label || SITE_DEFAULTS.heroFloat1Label,
    heroFloat2Image: row.heroFloat2Image || SITE_DEFAULTS.heroFloat2Image,
    heroFloat2Label: row.heroFloat2Label || SITE_DEFAULTS.heroFloat2Label,

    taxRate: row.taxRate,
    taxLabel: row.taxLabel,
    currency: row.currency,
    minPickupMinutes: row.minPickupMinutes,
    maxPickupDays: row.maxPickupDays,
    cateringMinGuests: row.cateringMinGuests,
    cateringMaxGuests: row.cateringMaxGuests,

    maintenanceMode: row.maintenanceMode,
    maintenanceTitle: row.maintenanceTitle,
    maintenanceMessage: row.maintenanceMessage,
    maintenanceTitleVn: row.maintenanceTitleVn || SITE_DEFAULTS.maintenanceTitleVn,
    maintenanceMessageVn: row.maintenanceMessageVn || SITE_DEFAULTS.maintenanceMessageVn,

    resendApiKey: row.resendApiKey,
    notifyEmail: row.notifyEmail,

    stripeEnabled: row.stripeEnabled,
    stripeMode: (row.stripeMode === "live" ? "live" : "test"),
    stripePublishableKey: row.stripePublishableKey,
    stripeSecretKey: row.stripeSecretKey,
    stripeWebhookSecret: row.stripeWebhookSecret,
  };
});

/** Public-safe settings — never include secret keys. Use this when passing settings to client. */
export function toPublicSettings(s: SiteSettings) {
  return {
    name: s.name,
    sloganEn: s.sloganEn,
    sloganVn: s.sloganVn,
    logo: s.logo,
    phone: s.phone,
    email: s.email,
    address: s.address,
    website: s.website,
    facebook: s.facebook,
    hours: s.hours,
    mapEmbedUrl: s.mapEmbedUrl,
    homeHeroLine1: s.homeHeroLine1,
    homeHeroLine2: s.homeHeroLine2,
    homeHeroLine3: s.homeHeroLine3,
    homeHeroIntro: s.homeHeroIntro,
    aboutStory: s.aboutStory,
    homeHeroLine1Vn: s.homeHeroLine1Vn,
    homeHeroLine2Vn: s.homeHeroLine2Vn,
    homeHeroLine3Vn: s.homeHeroLine3Vn,
    homeHeroIntroVn: s.homeHeroIntroVn,
    aboutStoryVn: s.aboutStoryVn,
    heroMainImage: s.heroMainImage,
    heroFloat1Image: s.heroFloat1Image,
    heroFloat1Label: s.heroFloat1Label,
    heroFloat2Image: s.heroFloat2Image,
    heroFloat2Label: s.heroFloat2Label,
    taxRate: s.taxRate,
    taxLabel: s.taxLabel,
    currency: s.currency,
    minPickupMinutes: s.minPickupMinutes,
    maxPickupDays: s.maxPickupDays,
    cateringMinGuests: s.cateringMinGuests,
    cateringMaxGuests: s.cateringMaxGuests,
    maintenanceMode: s.maintenanceMode,
    maintenanceTitle: s.maintenanceTitle,
    maintenanceMessage: s.maintenanceMessage,
    maintenanceTitleVn: s.maintenanceTitleVn,
    maintenanceMessageVn: s.maintenanceMessageVn,
    notifyEmail: s.notifyEmail, // safe to expose
    stripeEnabled: s.stripeEnabled,
    stripeMode: s.stripeMode,
    stripePublishableKey: s.stripePublishableKey, // safe to expose
  };
}

/** Pick the lang-appropriate value, falling back to the other lang if the chosen one is blank. */
export function localized<T extends Record<string, unknown>>(s: T, key: string, lang: "en" | "vn"): string {
  if (lang === "vn") {
    const v = (s as Record<string, unknown>)[`${key}Vn`];
    if (typeof v === "string" && v.trim()) return v;
  }
  const en = (s as Record<string, unknown>)[key];
  return typeof en === "string" ? en : "";
}
