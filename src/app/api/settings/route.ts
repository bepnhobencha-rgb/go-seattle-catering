import { NextResponse } from "next/server";
import { getSettings, toPublicSettings } from "@/lib/settings";

// Public, secret-free settings — used by client components that need tax rate, pickup constraints, etc.
export async function GET() {
  const s = await getSettings();
  return NextResponse.json(toPublicSettings(s));
}
