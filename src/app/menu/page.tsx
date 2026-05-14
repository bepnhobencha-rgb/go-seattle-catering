import { prisma } from "@/lib/prisma";
import { MenuView } from "./MenuView";
import { maintenanceGate } from "@/lib/maintenance";
import { dict } from "@/lib/i18n";
import { getLang } from "@/lib/i18n-server";
import { menuSchema } from "@/lib/structured-data";
import { siteUrl } from "@/lib/site-url";
import { getSettings } from "@/lib/settings";

export const metadata = {
  title: "Menu",
  description:
    "Explore our authentic Vietnamese menu — bánh mì, phở, gỏi cuốn, cơm, bún, milk tea, fresh smoothies and more. Order online for pickup in Seattle.",
};

export const revalidate = 0;

export default async function MenuPage() {
  await maintenanceGate();
  const [lang, settings] = await Promise.all([getLang(), getSettings()]);
  const url = siteUrl(settings);
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

  const schema = menuSchema(url, categories);
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <MenuView categories={categories} toppings={toppings} lang={lang} t={dict[lang]} />
    </>
  );
}
