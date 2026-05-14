import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getSettings } from "@/lib/settings";
import { Construction } from "lucide-react";

/**
 * Thin banner shown ONLY when:
 *   - maintenance mode is ON, AND
 *   - the visitor is signed in as admin
 *
 * Lets admin know visitors are seeing the Coming Soon page while they have
 * full access to preview the site.
 */
export async function AdminMaintenanceBanner() {
  const settings = await getSettings();
  if (!settings.maintenanceMode) return null;

  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN") return null;

  return (
    <div className="bg-yellow-500/15 border-b border-yellow-500/40 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center justify-between gap-3 flex-wrap text-xs">
        <p className="text-yellow-200 flex items-center gap-2">
          <Construction className="w-3.5 h-3.5" />
          <span>
            <strong>Maintenance mode ON</strong> — visitors see the Coming Soon page.
            You&apos;re previewing as admin.
          </span>
        </p>
        <Link
          href="/admin/settings"
          className="text-yellow-200 hover:text-yellow-100 underline font-semibold"
        >
          Manage →
        </Link>
      </div>
    </div>
  );
}
