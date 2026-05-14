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

  // Content
  homeHeroLine1: z.string().max(120).default(""),
  homeHeroLine2: z.string().max(120).default(""),
  homeHeroLine3: z.string().max(120).default(""),
  homeHeroIntro: z.string().max(500).default(""),
  aboutStory: z.string().max(5000).default(""),

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
    // Never echo back secret key
    return NextResponse.json({
      ok: true,
      settings: { ...updated, stripeSecretKey: updated.stripeSecretKey ? "***" : "", stripeWebhookSecret: updated.stripeWebhookSecret ? "***" : "" },
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid", issues: err.issues }, { status: 400 });
    }
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
