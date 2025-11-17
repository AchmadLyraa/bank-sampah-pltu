import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding Controller Only...");

  // HAPUS CONTROLLER LAMA
  await prisma.controller.deleteMany({
    where: { email: "admin@controller.com" },
  });

  const hashedPassword = await bcrypt.hash("kaltimteluk!", 10);

  const controller = await prisma.controller.create({
    data: {
      nama: "Super Admin Controller",
      email: "admin@controller.com",
      password: hashedPassword,
    },
  });

  console.log("✅ Controller recreated from scratch");
  console.log(`LOGIN: ${controller.email} / kaltimteluk!`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
