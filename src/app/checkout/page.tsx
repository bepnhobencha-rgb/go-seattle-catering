import { maintenanceGate } from "@/lib/maintenance";
import { CheckoutForm } from "./CheckoutForm";

export const revalidate = 0;

export default async function CheckoutPage() {
  const s = await maintenanceGate();
  return (
    <CheckoutForm
      taxRate={s.taxRate}
      taxLabel={s.taxLabel}
      minPickupMinutes={s.minPickupMinutes}
      maxPickupDays={s.maxPickupDays}
      stripeEnabled={s.stripeEnabled}
    />
  );
}
