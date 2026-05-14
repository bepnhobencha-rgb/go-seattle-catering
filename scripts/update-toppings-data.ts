/**
 * One-off: set allowsToppings=true on drink categories,
 * and add Vietnamese names + display order to seeded toppings.
 *
 *   vercel env pull .env.production
 *   mv .env .env.bak && mv .env.production .env
 *   npx ts-node --project prisma/tsconfig.json scripts/update-toppings-data.ts
 *   rm .env && mv .env.bak .env
 */
import { PrismaClient } from "@prisma/client";

const DRINK_SLUGS = ["ice-juice", "milk-tea", "coffee", "smoothies"];

const TOPPING_VN: Record<string, { vn: string; order: number }> = {
  "Tapioca": { vn: "Trân châu", order: 0 },
  "Strawberry Popping": { vn: "Popping dâu", order: 1 },
  "Mango Popping": { vn: "Popping xoài", order: 2 },
  "Lychee Popping": { vn: "Popping vải", order: 3 },
  "Grass Jelly": { vn: "Sương sáo", order: 4 },
  "Mango Jelly": { vn: "Thạch xoài", order: 5 },
  "Rainbow Jelly": { vn: "Thạch ngũ sắc", order: 6 },
  "Lychee Coconut Jelly": { vn: "Thạch vải dừa", order: 7 },
  "Red Beans": { vn: "Đậu đỏ", order: 8 },
  "Crystal Boba": { vn: "Boba pha lê", order: 9 },
};

async function main() {
  const prisma = new PrismaClient();
  try {
    // Enable toppings on drink categories
    const result = await prisma.category.updateMany({
      where: { slug: { in: DRINK_SLUGS } },
      data: { allowsToppings: true },
    });
    console.log(`✅ Enabled toppings on ${result.count} drink categories`);

    // Update existing toppings with VN names + order
    let updated = 0;
    for (const [name, info] of Object.entries(TOPPING_VN)) {
      const r = await prisma.topping.updateMany({
        where: { name },
        data: { nameVn: info.vn, displayOrder: info.order },
      });
      updated += r.count;
    }
    console.log(`✅ Updated ${updated} toppings with Vietnamese names`);
  } finally {
    await prisma.$disconnect();
  }
}

main();
