import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidateTag } from "next/cache";

const Body = z.object({
  name: z.string().min(1).max(80).optional(),
  nameVn: z.string().max(80).optional(),
  price: z.number().nonnegative().optional(),
  isActive: z.boolean().optional(),
  displayOrder: z.number().int().optional(),
  categoryIds: z.array(z.string()).optional(),
});

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  return session?.user?.role === "ADMIN";
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  try {
    const { categoryIds, ...rest } = Body.parse(await req.json());
    const topping = await prisma.topping.update({
      where: { id: params.id },
      data: {
        ...rest,
        ...(categoryIds !== undefined && {
          categories: { set: categoryIds.map((id) => ({ id })) },
        }),
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

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  try {
    await prisma.topping.delete({ where: { id: params.id } });
    revalidateTag("menu");
    return NextResponse.json({ ok: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Not found";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
