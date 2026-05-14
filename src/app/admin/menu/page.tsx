import { prisma } from "@/lib/prisma";
import { MenuAdmin } from "./MenuAdmin";

export const revalidate = 0;

export default async function AdminMenu() {
  const categories = await prisma.category.findMany({
    orderBy: { displayOrder: "asc" },
    include: {
      items: { orderBy: { displayOrder: "asc" } },
    },
  });
  return <MenuAdmin categories={categories} />;
}
