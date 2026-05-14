import { prisma } from "@/lib/prisma";
import { TestimonialsAdmin } from "./TestimonialsAdmin";

export const revalidate = 0;

export default async function AdminTestimonialsPage() {
  const items = await prisma.testimonial.findMany({
    orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }],
  });
  return <TestimonialsAdmin initial={items} />;
}
