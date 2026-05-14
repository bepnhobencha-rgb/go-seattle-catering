import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidateTag } from "next/cache";

const Body = z.object({
  categoryId: z.string().min(1),
  code: z.string().max(20).nullable().optional(),
  nameEn: z.string().min(1).max(160),
  nameVn: z.string().max(160).nullable().optional(),
  description: z.string().max(1000).nullable().optional(),
  descriptionVn: z.string().max(1000).nullable().optional(),
  basePrice: z.number().nonnegative(),
  image: z.string().nullable().optional(),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  try {
    const data = Body.parse(await req.json());

    // Verify category exists
    const category = await prisma.category.findUnique({ where: { id: data.categoryId } });
    if (!category) return NextResponse.json({ error: "Category not found" }, { status: 400 });

    // Append at end of category
    const maxOrder = await prisma.menuItem.aggregate({
      where: { categoryId: data.categoryId },
      _max: { displayOrder: true },
    });
    const displayOrder = (maxOrder._max.displayOrder ?? -1) + 1;

    const item = await prisma.menuItem.create({
      data: { ...data, displayOrder },
    });
    revalidateTag("menu");
    revalidateTag("featured");
    return NextResponse.json({ ok: true, item });
  } catch (err) {
    if (err instanceof z.ZodError)
      return NextResponse.json({ error: "Invalid", issues: err.issues }, { status: 400 });
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
