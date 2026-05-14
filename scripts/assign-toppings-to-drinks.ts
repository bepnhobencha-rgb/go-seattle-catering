/**
 * One-off: assign all 10 seeded toppings to all 4 drink categories,
 * preserving the original "global pool for drinks" behavior post-migration.
 */
import { PrismaClient } from "@prisma/client";

const DRINK_SLUGS = ["ice-juice", "milk-tea", "coffee", "smoothies"];

async function main() {
  const prisma = new PrismaClient();
  try {
    const drinks = await prisma.category.findMany({ where: { slug: { in: DRINK_SLUGS } } });
    const toppings = await prisma.topping.findMany();
    let count = 0;
    for (const t of toppings) {
      await prisma.topping.update({
        where: { id: t.id },
        data: { categories: { set: drinks.map((d) => ({ id: d.id })) } },
      });
      count++;
    }
    console.log(`✅ Assigned ${count} toppings to ${drinks.length} drink categories`);
  } finally {
    await prisma.$disconnect();
  }
}
main();
