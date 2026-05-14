import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const Body = z
  .object({
    name: z.string().min(1).max(120).optional(),
    email: z.string().email().optional(),
    currentPassword: z.string().optional(),
    newPassword: z.string().min(6).max(120).optional(),
  })
  .refine(
    (d) => {
      // If changing password, both must be provided
      if (d.newPassword || d.currentPassword) {
        return Boolean(d.newPassword && d.currentPassword);
      }
      return true;
    },
    { message: "Both current and new password are required when changing password" }
  );

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }
  try {
    const data = Body.parse(await req.json());

    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const update: { name?: string; email?: string; passwordHash?: string } = {};

    if (data.name && data.name !== user.name) update.name = data.name;

    if (data.email && data.email.toLowerCase() !== user.email) {
      const lower = data.email.toLowerCase();
      const taken = await prisma.user.findUnique({ where: { email: lower } });
      if (taken && taken.id !== user.id) {
        return NextResponse.json({ error: "Email already in use" }, { status: 400 });
      }
      update.email = lower;
    }

    if (data.newPassword && data.currentPassword) {
      const ok = await bcrypt.compare(data.currentPassword, user.passwordHash);
      if (!ok) return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
      update.passwordHash = await bcrypt.hash(data.newPassword, 10);
    }

    if (Object.keys(update).length === 0) {
      return NextResponse.json({ ok: true, message: "Nothing changed" });
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: update,
      select: { id: true, email: true, name: true },
    });
    return NextResponse.json({ ok: true, user: updated });
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
