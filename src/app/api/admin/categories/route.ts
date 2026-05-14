import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const Body = z.object({
  slug: z.string().min(1).max(60).regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters/digits/dashes"),
  nameEn: z.string().min(1).max(120),
  nameVn: z.string().min(1).max(120),
  displayOrder: z.number().int().optional(),
  isActive: z.boolean().default(true),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  try {
    const data = Body.parse(await req.json());
    const exists = await prisma.category.findUnique({ where: { slug: data.slug } });
    if (exists) return NextResponse.json({ error: "Slug already in use" }, { status: 400 });

    const max = await prisma.category.aggregate({ _max: { displayOrder: true } });
    const displayOrder = data.displayOrder ?? (max._max.displayOrder ?? -1) + 1;

    const category = await prisma.category.create({ data: { ...data, displayOrder } });
    return NextResponse.json({ ok: true, category });
  } catch (err) {
    if (err instanceof z.ZodError)
      return NextResponse.json({ error: "Invalid", issues: err.issues }, { status: 400 });
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
