import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const Hour = z.object({
  day: z.string().min(1).max(20),
  hours: z.string().min(1).max(80),
});

const Body = z.object({
  // Brand
  name: z.string().min(1).max(160),
  sloganEn: z.string().max(200).default(""),
  sloganVn: z.string().max(200).default(""),
  logo: z.string().max(500).default(""),

  // Contact
  phone: z.string().max(60).default(""),
  email: z.string().max(160).default(""),
  address: z.string().max(300).default(""),
  website: z.string().max(200).default(""),
  facebook: z.string().max(300).default(""),
  hours: z.array(Hour).max(20).default([]),
  mapEmbedUrl: z.string().max(2000).default(""),

  // Content (English)
  homeHeroLine1: z.string().max(120).default(""),
  homeHeroLine2: z.string().max(120).default(""),
  homeHeroLine3: z.string().max(120).default(""),
  homeHeroIntro: z.string().max(500).default(""),
  aboutStory: z.string().max(5000).default(""),

  // Content (Vietnamese)
  homeHeroLine1Vn: z.string().max(120).default(""),
  homeHeroLine2Vn: z.string().max(120).default(""),
  homeHeroLine3Vn: z.string().max(120).default(""),
  homeHeroIntroVn: z.string().max(500).default(""),
  aboutStoryVn: z.string().max(5000).default(""),

  // Hero images
  heroMainImage: z.string().max(500).default(""),
  heroFloat1Image: z.string().max(500).default(""),
  heroFloat1Label: z.string().max(120).default(""),
  heroFloat2Image: z.string().max(500).default(""),
  heroFloat2Label: z.string().max(120).default(""),

  // Operations
  taxRate: z.number().min(0).max(1).default(0.1025),
  taxLabel: z.string().max(60).default("Sales Tax"),
  currency: z.string().min(3).max(6).default("USD"),
  minPickupMinutes: z.number().int().min(0).max(1440).default(30),
  maxPickupDays: z.number().int().min(1).max(60).default(7),
  cateringMinGuests: z.number().int().min(1).max(10000).default(10),
  cateringMaxGuests: z.number().int().min(1).max(10000).default(1000),

  // Maintenance
  maintenanceMode: z.boolean().default(false),
  maintenanceTitle: z.string().max(200).default(""),
  maintenanceMessage: z.string().max(1000).default(""),
  maintenanceTitleVn: z.string().max(200).default(""),
  maintenanceMessageVn: z.string().max(1000).default(""),

  // Email
  resendApiKey: z.string().max(200).default(""),
  notifyEmail: z.string().max(160).default(""),

  // Stripe
  stripeEnabled: z.boolean().default(false),
  stripeMode: z.enum(["test", "live"]).default("test"),
  stripePublishableKey: z.string().max(200).default(""),
  stripeSecretKey: z.string().max(200).default(""),
  stripeWebhookSecret: z.string().max(200).default(""),
});

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  try {
    const data = Body.parse(await req.json());
    if (data.cateringMaxGuests < data.cateringMinGuests) {
      return NextResponse.json(
        { error: "Catering max guests must be ≥ min guests" },
        { status: 400 }
      );
    }
    const filteredHours = data.hours.filter((h) => h.day.trim() && h.hours.trim());
    const payload = {
      name: data.name,
      sloganEn: data.sloganEn,
      sloganVn: data.sloganVn,
      logo: data.logo || "/images/logos/logo-dark.jpg",
      phone: data.phone,
      email: data.email,
      address: data.address,
      website: data.website,
      facebook: data.facebook,
      hours: JSON.stringify(filteredHours),
      mapEmbedUrl: data.mapEmbedUrl,
      homeHeroLine1: data.homeHeroLine1,
      homeHeroLine2: data.homeHeroLine2,
      homeHeroLine3: data.homeHeroLine3,
      homeHeroIntro: data.homeHeroIntro,
      aboutStory: data.aboutStory,
      homeHeroLine1Vn: data.homeHeroLine1Vn,
      homeHeroLine2Vn: data.homeHeroLine2Vn,
      homeHeroLine3Vn: data.homeHeroLine3Vn,
      homeHeroIntroVn: data.homeHeroIntroVn,
      aboutStoryVn: data.aboutStoryVn,
      heroMainImage: data.heroMainImage || "/images/food/banh-mi-tray.jpg",
      heroFloat1Image: data.heroFloat1Image || "/images/food/spring-rolls.jpg",
      heroFloat1Label: data.heroFloat1Label || "Gỏi Cuốn · $7.85",
      heroFloat2Image: data.heroFloat2Image || "/images/food/ca-phe.jpg",
      heroFloat2Label: data.heroFloat2Label || "Cà Phê · $7.00",
      taxRate: data.taxRate,
      taxLabel: data.taxLabel,
      currency: data.currency,
      minPickupMinutes: data.minPickupMinutes,
      maxPickupDays: data.maxPickupDays,
      cateringMinGuests: data.cateringMinGuests,
      cateringMaxGuests: data.cateringMaxGuests,
      maintenanceMode: data.maintenanceMode,
      maintenanceTitle: data.maintenanceTitle || "We're crafting something special",
      maintenanceMessage: data.maintenanceMessage || "Our website is currently being prepared. We'll be ready to welcome you very soon.",
      maintenanceTitleVn: data.maintenanceTitleVn || "Chúng tôi đang chuẩn bị điều đặc biệt",
      maintenanceMessageVn: data.maintenanceMessageVn || "Website đang trong giai đoạn hoàn thiện. Chúng tôi sẽ sẵn sàng đón tiếp bạn rất sớm.",
      resendApiKey: data.resendApiKey,
      notifyEmail: data.notifyEmail,
      stripeEnabled: data.stripeEnabled,
      stripeMode: data.stripeMode,
      stripePublishableKey: data.stripePublishableKey,
      stripeSecretKey: data.stripeSecretKey,
      stripeWebhookSecret: data.stripeWebhookSecret,
    };
    const updated = await prisma.settings.upsert({
      where: { id: "default" },
      update: payload,
      create: { id: "default", ...payload },
    });
    // Never echo back secret keys
    return NextResponse.json({
      ok: true,
      settings: {
        ...updated,
        stripeSecretKey: updated.stripeSecretKey ? "***" : "",
        stripeWebhookSecret: updated.stripeWebhookSecret ? "***" : "",
        resendApiKey: updated.resendApiKey ? "***" : "",
      },
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid", issues: err.issues }, { status: 400 });
    }
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
