import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getSettings } from "./settings";

/**
 * Use at the top of every public page.
 *
 * Behavior:
 *  - Maintenance OFF → pages render normally.
 *  - Maintenance ON + visitor is admin → admin sees full site (for preview/management).
 *  - Maintenance ON + everyone else → redirected to /maintenance.
 *
 * Returns settings so the page doesn't need to fetch them again.
 */
export async function maintenanceGate() {
  const settings = await getSettings();
  if (settings.maintenanceMode) {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== "ADMIN") {
      redirect("/maintenance");
    }
    // Admin is signed in — let them through to preview the live site.
  }
  return settings;
}
