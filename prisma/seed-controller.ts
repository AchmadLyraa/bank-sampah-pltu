import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding Controller Only...");

  const hashedPassword = await bcrypt.hash("k4lt1mt3luk", 10);

  const controller = await prisma.controller.upsert({
    where: { email: "admin@controller.com" },
    update: {
      password: hashedPassword, // selalu di-update biar fresh
    },
    create: {
      nama: "Super Admin Controller",
      email: "admin@controller.com",
      password: hashedPassword,
    },
  });

  console.log("✅ Controller created/updated");
  console.log(`LOGIN: ${controller.email} / k4lt1mt3luk`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
