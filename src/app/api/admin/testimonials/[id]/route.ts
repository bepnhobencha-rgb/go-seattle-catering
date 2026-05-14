import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const Body = z.object({
  name: z.string().min(1).max(120).optional(),
  role: z.string().max(120).optional(),
  rating: z.number().int().min(1).max(5).optional(),
  text: z.string().min(1).max(2000).optional(),
  textVn: z.string().max(2000).optional(),
  isActive: z.boolean().optional(),
  displayOrder: z.number().int().optional(),
});

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") {
    return null;
  }
  return session;
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  try {
    const data = Body.parse(await req.json());
    const testimonial = await prisma.testimonial.update({ where: { id: params.id }, data });
    return NextResponse.json({ ok: true, testimonial });
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: "Invalid" }, { status: 400 });
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  try {
    await prisma.testimonial.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
