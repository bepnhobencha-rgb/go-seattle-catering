import { prisma } from "@/lib/prisma";
import { ToppingsAdmin } from "./ToppingsAdmin";

export const revalidate = 0;

export default async function AdminToppingsPage() {
  const toppings = await prisma.topping.findMany({
    orderBy: [{ displayOrder: "asc" }, { name: "asc" }],
  });
  return <ToppingsAdmin initial={toppings} />;
}
