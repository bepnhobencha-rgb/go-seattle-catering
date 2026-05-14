import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { testEmailConnection } from "@/lib/email";

const Body = z.object({ apiKey: z.string().min(8) });

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  try {
    const { apiKey } = Body.parse(await req.json());
    const result = await testEmailConnection(apiKey);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Invalid" }, { status: 400 });
  }
}
