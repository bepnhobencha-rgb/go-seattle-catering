import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import { notifyNewContact } from "@/lib/email";

const Body = z.object({
  name: z.string().min(1).max(120),
  email: z.string().email(),
  phone: z.string().max(40).optional().default(""),
  message: z.string().min(1).max(5000),
});

export async function POST(req: NextRequest) {
  try {
    const data = Body.parse(await req.json());
    const msg = await prisma.contactMessage.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone || null,
        message: data.message,
      },
    });

    // Fire-and-forget email notification
    const settings = await getSettings();
    notifyNewContact(settings, { ...data, phone: data.phone || null }).catch((err) =>
      console.error("[Contact] email failed", err)
    );

    return NextResponse.json({ ok: true, id: msg.id });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid", issues: err.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
