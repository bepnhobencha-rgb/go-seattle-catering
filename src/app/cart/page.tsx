import { maintenanceGate } from "@/lib/maintenance";
import { CartView } from "./CartView";

export const revalidate = 0;

export default async function CartPage() {
  const s = await maintenanceGate();
  return (
    <CartView
      taxRate={s.taxRate}
      taxLabel={s.taxLabel}
      stripeEnabled={s.stripeEnabled}
    />
  );
}
