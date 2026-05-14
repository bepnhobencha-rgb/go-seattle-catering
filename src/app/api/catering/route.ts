import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { genOrderNumber } from "@/lib/utils";
import { EVENT_TYPES, SERVICE_STYLES } from "@/lib/enums";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getSettings } from "@/lib/settings";
import { notifyNewCatering } from "@/lib/email";

const Body = z.object({
  eventType: z.enum(EVENT_TYPES),
  eventDate: z.string(),
  eventTime: z.string(),
  guestCount: z.number().int().min(1).max(5000),
  serviceStyle: z.enum(SERVICE_STYLES),
  budgetRange: z.string().optional().default(""),
  menuRequests: z.string().optional().default(""),
  customerName: z.string().min(1).max(120),
  phone: z.string().min(3).max(40),
  email: z.string().email(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = Body.parse(body);
    const settings = await getSettings();

    if (data.guestCount < settings.cateringMinGuests || data.guestCount > settings.cateringMaxGuests) {
      return NextResponse.json(
        { error: `Guest count must be between ${settings.cateringMinGuests} and ${settings.cateringMaxGuests}` },
        { status: 400 }
      );
    }

    const eventDate = new Date(data.eventDate);
    if (isNaN(eventDate.getTime())) {
      return NextResponse.json({ error: "Invalid event date" }, { status: 400 });
    }

    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    const requestNumber = genOrderNumber("CT");

    const cr = await prisma.cateringRequest.create({
      data: {
        requestNumber,
        userId: userId ?? null,
        eventType: data.eventType,
        eventDate,
        eventTime: data.eventTime,
        guestCount: data.guestCount,
        serviceStyle: data.serviceStyle,
        budgetRange: data.budgetRange || null,
        menuRequests: data.menuRequests || null,
        customerName: data.customerName,
        phone: data.phone,
        email: data.email,
        status: "NEW",
      },
    });

    console.log(`[Catering] New request ${requestNumber} from ${data.email}, ${data.guestCount} guests`);
    notifyNewCatering(settings, cr).catch((err) => console.error("[Catering email] failed", err));

    return NextResponse.json({ ok: true, requestNumber: cr.requestNumber, id: cr.id });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request", issues: err.issues }, { status: 400 });
    }
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
