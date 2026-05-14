import { maintenanceGate } from "@/lib/maintenance";
import { CartView } from "./CartView";
import { dict } from "@/lib/i18n";
import { getLang } from "@/lib/i18n-server";

export const revalidate = 0;

export default async function CartPage() {
  const [s, lang] = await Promise.all([maintenanceGate(), getLang()]);
  return (
    <CartView
      taxRate={s.taxRate}
      taxLabel={s.taxLabel}
      stripeEnabled={s.stripeEnabled}
      t={dict[lang]}
      lang={lang}
    />
  );
}
