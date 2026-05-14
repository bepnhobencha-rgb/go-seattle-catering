import { prisma } from "@/lib/prisma";
import { MessagesAdmin } from "./MessagesAdmin";

export const revalidate = 0;

export default async function AdminMessagesPage() {
  const messages = await prisma.contactMessage.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
  });
  return <MessagesAdmin initial={messages} />;
}
