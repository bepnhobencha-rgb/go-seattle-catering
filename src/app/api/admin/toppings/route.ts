import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidateTag } from "next/cache";

const Body = z.object({
  name: z.string().min(1).max(80),
  nameVn: z.string().max(80).default(""),
  price: z.number().nonnegative(),
  isActive: z.boolean().default(true),
  displayOrder: z.number().int().optional(),
  categoryIds: z.array(z.string()).default([]),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  try {
    const { categoryIds, ...rest } = Body.parse(await req.json());
    const max = await prisma.topping.aggregate({ _max: { displayOrder: true } });
    const displayOrder = rest.displayOrder ?? (max._max.displayOrder ?? -1) + 1;
    const topping = await prisma.topping.create({
      data: {
        ...rest,
        displayOrder,
        categories: { connect: categoryIds.map((id) => ({ id })) },
      },
      include: { categories: { select: { id: true } } },
    });
    revalidateTag("menu");
    return NextResponse.json({
      ok: true,
      topping: { ...topping, categoryIds: topping.categories.map((c) => c.id) },
    });
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: "Invalid" }, { status: 400 });
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
