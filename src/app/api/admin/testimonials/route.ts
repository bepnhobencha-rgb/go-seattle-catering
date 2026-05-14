import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const Body = z.object({
  name: z.string().min(1).max(120),
  role: z.string().max(120).default(""),
  rating: z.number().int().min(1).max(5).default(5),
  text: z.string().min(1).max(2000),
  isActive: z.boolean().default(true),
  displayOrder: z.number().int().default(0),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  try {
    const data = Body.parse(await req.json());
    const testimonial = await prisma.testimonial.create({ data });
    return NextResponse.json({ ok: true, testimonial });
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: "Invalid" }, { status: 400 });
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
