/**
 * One-off: update the admin user's email + password.
 * Run against the desired DB by setting DATABASE_URL in the environment.
 *
 *   vercel env pull .env.production
 *   mv .env .env.bak && mv .env.production .env
 *   npx ts-node --project prisma/tsconfig.json scripts/update-admin.ts
 *   rm .env && mv .env.bak .env
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const NEW_EMAIL = "govietcatering@gmail.com";
const NEW_PASSWORD = "Admin123";
const NEW_NAME = "Gõ Việt Admin";

async function main() {
  const prisma = new PrismaClient();
  try {
    const admin = await prisma.user.findFirst({ where: { role: "ADMIN" } });
    if (!admin) {
      console.error("No admin user found.");
      process.exit(1);
    }
    const passwordHash = await bcrypt.hash(NEW_PASSWORD, 10);
    const updated = await prisma.user.update({
      where: { id: admin.id },
      data: {
        email: NEW_EMAIL,
        passwordHash,
        name: NEW_NAME,
      },
    });
    console.log(`✅ Updated admin: ${admin.email} → ${updated.email}`);
    console.log(`   Password set to: ${NEW_PASSWORD}`);
  } finally {
    await prisma.$disconnect();
  }
}

main();
