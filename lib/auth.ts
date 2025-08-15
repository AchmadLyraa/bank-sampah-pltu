import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

import type {
  BankSampah,
  Person,
  NasabahRelationshipForSession,
  Controller,
  Role,
} from "@/types"; // Import Controller and Role

// Define the discriminated union type for the authentication result
type AuthenticateResult =
  | {
      success: true;
      user: {
        userId: string;
        email: string;
        nama: string;
        userType: "bank-sampah" | "controller" | "nasabah";
        role: string;
        personId?: string;
        bankSampahRelations?: NasabahRelationshipForSession[];
        activeBankSampahId?: string;
      };
    }
  | {
      success: false;
      error: string;
    };

export async function authenticateUser(data: {
  email: string;
  password: string;
}): Promise<AuthenticateResult> {
  const { email, password } = data;

  try {
    // First, try to find in controller
    const controller = await prisma.controller.findUnique({
      where: { email },
    });

    if (controller) {
      const isValid = await bcrypt.compare(password, controller.password);
      if (isValid) {
        return {
          success: true,
          user: {
            userId: controller.id,
            email: controller.email,
            nama: controller.nama,
            userType: "controller",
            role: controller.role,
          },
        };
      }
    }

    // Second, try to find in bank sampah (admin)
    const bankSampah = await prisma.bankSampah.findUnique({
      where: {
        email,
        isActive: true,
      },
    });

    if (bankSampah) {
      const isValid = await bcrypt.compare(password, bankSampah.password);
      if (isValid) {
        return {
          success: true,
          user: {
            userId: bankSampah.id,
            email: bankSampah.email,
            nama: bankSampah.nama,
            userType: "bank-sampah",
            role: bankSampah.role,
          },
        };
      }
    }

    // If not found in bank sampah, try Person (customer)
    const person = await prisma.person.findUnique({
      where: { email },
    });

    if (person) {
      const isValid = await bcrypt.compare(password, person.password);
      if (!isValid) {
        return { success: false, error: "Password salah" };
      }

      // 🔄 NEW: Find ALL active Nasabah relationships for this person
      const nasabahRelationships = await prisma.nasabah.findMany({
        where: {
          personId: person.id,
          isActive: true, // Must be an active relationship
          bankSampah: {
            isActive: true,
          },
        },
        include: {
          bankSampah: {
            select: {
              id: true,
              nama: true,
            },
          },
        },
      });

      if (nasabahRelationships.length === 0) {
        return {
          success: false,
          error:
            "Akun nasabah Anda tidak ditemukan atau tidak aktif di bank sampah manapun.",
        };
      }

      // Map to NasabahRelationshipForSession type
      const mappedRelationships: NasabahRelationshipForSession[] =
        nasabahRelationships.map((rel) => ({
          nasabahId: rel.id,
          bankSampahId: rel.bankSampahId,
          bankSampahNama: rel.bankSampah?.nama || "Unknown Bank Sampah", // Fallback if name is null
          saldo: rel.saldo,
        }));

      // Return the Person object and all active relationships
      return {
        success: true,
        user: {
          userId: person.id,
          email: person.email,
          nama: person.nama,
          userType: "nasabah",
          role: "NASABAH",
          personId: person.id,
          bankSampahRelations: mappedRelationships,
          activeBankSampahId: mappedRelationships[0]?.bankSampahId, // Default ke yang pertama
        },
      };
    }

    // If neither found or password invalid
    return { success: false, error: "Email atau password salah" };
  } catch (error) {
    console.error("Authentication error:", error);
    return { success: false, error: "Terjadi kesalahan sistem" };
  }
}

export async function authenticateController(data: {
  email: string;
  password: string;
}): Promise<Controller | null> {
  const { email, password } = data;

  try {
    const controller = await prisma.controller.findUnique({
      where: { email },
    });

    if (!controller) {
      return null;
    }

    const isValid = await bcrypt.compare(password, controller.password);
    if (!isValid) {
      return null;
    }

    return controller;
  } catch (error) {
    console.error("Controller authentication error:", error);
    return null;
  }
}
