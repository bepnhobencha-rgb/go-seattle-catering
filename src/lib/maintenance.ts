import { redirect } from "next/navigation";
import { getSettings } from "./settings";

/**
 * Use at the top of every public page. If maintenance mode is on, redirects to /maintenance.
 * Returns settings so the page doesn't need to fetch them again.
 */
export async function maintenanceGate() {
  const settings = await getSettings();
  if (settings.maintenanceMode) {
    redirect("/maintenance");
  }
  return settings;
}
