import { prisma } from "@/lib/prisma";

export async function isEmailUnique(
  email: string,
  excludeId?: string,
  excludeTable?: "controller" | "bankSampah" | "person",
) {
  try {
    // Check in Controller table
    if (excludeTable !== "controller") {
      const controllerExists = await prisma.controller.findFirst({
        where: {
          email,
          ...(excludeId && excludeTable === "controller"
            ? { id: { not: excludeId } }
            : {}),
        },
      });
      if (controllerExists) return false;
    }

    // Check in BankSampah table
    if (excludeTable !== "bankSampah") {
      const bankSampahExists = await prisma.bankSampah.findFirst({
        where: {
          email,
          ...(excludeId && excludeTable === "bankSampah"
            ? { id: { not: excludeId } }
            : {}),
        },
      });
      if (bankSampahExists) return false;
    }

    // Check in Person table (nasabah)
    if (excludeTable !== "person") {
      const personExists = await prisma.person.findFirst({
        where: {
          email,
          ...(excludeId && excludeTable === "person"
            ? { id: { not: excludeId } }
            : {}),
        },
      });
      if (personExists) return false;
    }

    return true;
  } catch (error) {
    console.error("Error checking email uniqueness:", error);
    return false;
  }
}
