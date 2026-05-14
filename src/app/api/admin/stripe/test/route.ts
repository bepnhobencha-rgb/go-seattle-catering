import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { testStripeConnection } from "@/lib/stripe";

const Body = z.object({
  secretKey: z.string().min(8),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  try {
    const { secretKey } = Body.parse(await req.json());
    const result = await testStripeConnection(secretKey);
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: "Invalid" }, { status: 400 });
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
