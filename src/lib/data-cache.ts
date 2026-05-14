import { cache } from "react";
import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";

/**
 * Cached menu fetchers. Two layers:
 *   - React `cache()` dedupes within a single request render.
 *   - `unstable_cache` keeps results across requests for `revalidate` seconds
 *     and lets admin endpoints invalidate explicitly via `revalidateTag()`.
 */

const _getMenuCategoriesWithItems = unstable_cache(
  async () => {
    return prisma.category.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: "asc" },
      include: {
        items: {
          where: { isActive: true },
          orderBy: { displayOrder: "asc" },
        },
      },
    });
  },
  ["menu-categories-with-items"],
  { tags: ["menu"], revalidate: 120 }
);

export const getMenuCategoriesWithItems = cache(_getMenuCategoriesWithItems);

const _getActiveCategories = unstable_cache(
  async () => {
    return prisma.category.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: "asc" },
      select: { id: true, slug: true, nameEn: true, nameVn: true },
    });
  },
  ["active-categories"],
  { tags: ["menu"], revalidate: 300 }
);
export const getActiveCategories = cache(_getActiveCategories);

const _getFeaturedItems = unstable_cache(
  async () => {
    return prisma.menuItem.findMany({
      where: { isActive: true, isFeatured: true },
      include: { category: true },
      orderBy: { displayOrder: "asc" },
      take: 6,
    });
  },
  ["featured-items"],
  { tags: ["menu", "featured"], revalidate: 120 }
);
export const getFeaturedItems = cache(_getFeaturedItems);

const _getActiveTestimonials = unstable_cache(
  async () => {
    return prisma.testimonial.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: "asc" },
      take: 6,
    });
  },
  ["active-testimonials"],
  { tags: ["testimonials"], revalidate: 300 }
);
export const getActiveTestimonials = cache(_getActiveTestimonials);

const _getActiveToppings = unstable_cache(
  async () => {
    const rows = await prisma.topping.findMany({
      where: { isActive: true },
      include: { categories: { select: { id: true } } },
      orderBy: [{ displayOrder: "asc" }, { name: "asc" }],
    });
    return rows.map((t) => ({
      id: t.id,
      name: t.name,
      nameVn: t.nameVn,
      price: t.price,
      categoryIds: t.categories.map((c) => c.id),
    }));
  },
  ["active-toppings"],
  { tags: ["menu"], revalidate: 300 }
);
export const getActiveToppings = cache(_getActiveToppings);
