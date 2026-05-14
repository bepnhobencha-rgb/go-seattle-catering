import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { REQUEST_STATUSES } from "@/lib/enums";

const Body = z.object({
  status: z.enum(REQUEST_STATUSES),
  adminNotes: z.string().nullable().optional(),
  quotedAmount: z.number().nonnegative().nullable().optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  try {
    const data = Body.parse(await req.json());
    const updated = await prisma.cateringRequest.update({
      where: { id: params.id },
      data: {
        status: data.status,
        adminNotes: data.adminNotes ?? null,
        quotedAmount: data.quotedAmount ?? null,
      },
    });
    return NextResponse.json({ ok: true, request: updated });
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: "Invalid" }, { status: 400 });
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
