import { prisma } from "@/lib/prisma";
import { ToppingsAdmin } from "./ToppingsAdmin";

export const revalidate = 0;

export default async function AdminToppingsPage() {
  const [toppings, categories] = await Promise.all([
    prisma.topping.findMany({
      include: { categories: { select: { id: true } } },
      orderBy: [{ displayOrder: "asc" }, { name: "asc" }],
    }),
    prisma.category.findMany({
      orderBy: { displayOrder: "asc" },
      select: { id: true, nameEn: true, nameVn: true, allowsToppings: true },
    }),
  ]);

  const flat = toppings.map((t) => ({
    id: t.id,
    name: t.name,
    nameVn: t.nameVn,
    price: t.price,
    isActive: t.isActive,
    displayOrder: t.displayOrder,
    categoryIds: t.categories.map((c) => c.id),
  }));

  return <ToppingsAdmin initial={flat} categories={categories} />;
}
