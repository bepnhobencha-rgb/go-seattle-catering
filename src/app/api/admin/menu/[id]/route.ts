import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidateTag } from "next/cache";

const Body = z.object({
  basePrice: z.number().nonnegative().optional(),
  description: z.string().nullable().optional(),
  descriptionVn: z.string().nullable().optional(),
  isActive: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  nameEn: z.string().min(1).max(160).optional(),
  nameVn: z.string().nullable().optional(),
  code: z.string().nullable().optional(),
  categoryId: z.string().optional(),
  image: z.string().nullable().optional(),
  displayOrder: z.number().int().optional(),
});

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  return session?.user?.role === "ADMIN";
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  try {
    const data = Body.parse(await req.json());
    const item = await prisma.menuItem.update({ where: { id: params.id }, data });
    revalidateTag("menu");
    revalidateTag("featured");
    return NextResponse.json({ ok: true, item });
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: "Invalid" }, { status: 400 });
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  try {
    await prisma.menuItem.delete({ where: { id: params.id } });
    revalidateTag("menu");
    revalidateTag("featured");
    return NextResponse.json({ ok: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Not found";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
