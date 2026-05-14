import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const Body = z.object({
  slug: z.string().min(1).max(60).regex(/^[a-z0-9-]+$/).optional(),
  nameEn: z.string().min(1).max(120).optional(),
  nameVn: z.string().min(1).max(120).optional(),
  displayOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
});

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  return session?.user?.role === "ADMIN";
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  try {
    const data = Body.parse(await req.json());
    if (data.slug) {
      const taken = await prisma.category.findUnique({ where: { slug: data.slug } });
      if (taken && taken.id !== params.id) {
        return NextResponse.json({ error: "Slug already in use" }, { status: 400 });
      }
    }
    const category = await prisma.category.update({ where: { id: params.id }, data });
    return NextResponse.json({ ok: true, category });
  } catch (err) {
    if (err instanceof z.ZodError)
      return NextResponse.json({ error: "Invalid", issues: err.issues }, { status: 400 });
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  try {
    const count = await prisma.menuItem.count({ where: { categoryId: params.id } });
    if (count > 0) {
      return NextResponse.json(
        { error: `Cannot delete: category has ${count} menu items. Move or delete them first.` },
        { status: 400 }
      );
    }
    await prisma.category.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Not found";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
