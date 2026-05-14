import { maintenanceGate } from "@/lib/maintenance";
import { CheckoutForm } from "./CheckoutForm";
import { dict } from "@/lib/i18n";
import { getLang } from "@/lib/i18n-server";

export const revalidate = 0;

export default async function CheckoutPage() {
  const [s, lang] = await Promise.all([maintenanceGate(), getLang()]);
  return (
    <CheckoutForm
      taxRate={s.taxRate}
      taxLabel={s.taxLabel}
      minPickupMinutes={s.minPickupMinutes}
      maxPickupDays={s.maxPickupDays}
      stripeEnabled={s.stripeEnabled}
      t={dict[lang]}
      lang={lang}
    />
  );
}
