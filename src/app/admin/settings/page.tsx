import { getSettings } from "@/lib/settings";
import { SettingsForm } from "./SettingsForm";

export const revalidate = 0;

export default async function AdminSettingsPage() {
  const settings = await getSettings();
  return (
    <div className="max-w-3xl">
      <h2 className="font-display text-2xl font-bold text-gold-200 mb-2">Site settings</h2>
      <p className="text-sm text-cream/65 mb-6">
        Edit business info shown on the public website (footer, contact page, order confirmations).
      </p>
      <SettingsForm initial={settings} />
    </div>
  );
}
