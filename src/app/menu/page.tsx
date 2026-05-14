import { prisma } from "@/lib/prisma";
import { MenuView } from "./MenuView";
import { maintenanceGate } from "@/lib/maintenance";
import { dict } from "@/lib/i18n";
import { getLang } from "@/lib/i18n-server";

export const metadata = {
  title: "Menu — Gõ Seattle Catering",
  description: "Authentic Vietnamese dishes — bánh mì, cơm, bún, gỏi cuốn, drinks, smoothies.",
};

export const revalidate = 0;

export default async function MenuPage() {
  await maintenanceGate();
  const lang = await getLang();
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: { displayOrder: "asc" },
    include: {
      items: {
        where: { isActive: true },
        orderBy: { displayOrder: "asc" },
      },
    },
  });

  const toppings = await prisma.topping.findMany({
    where: { isActive: true },
    orderBy: { price: "asc" },
  });

  return <MenuView categories={categories} toppings={toppings} lang={lang} t={dict[lang]} />;
}
