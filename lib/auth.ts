import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

import type {
  BankSampah,
  Person,
  NasabahRelationshipForSession,
} from "@/types"; // 🆕 Import Person and NasabahRelationshipForSession

// Define the discriminated union type for the authentication result
type AuthenticateResult =
  | { type: "bank-sampah"; user: BankSampah }
  | {
      type: "nasabah";
      person: Person; // 🆕 Return the Person object
      nasabahRelationships: NasabahRelationshipForSession[]; // 🆕 Return all active relationships
    }
  | { error: string }
  | null;

export async function authenticateUser(data: {
  email: string;
  password: string;
}): Promise<AuthenticateResult> {
  const { email, password } = data;

  try {
    // First, try to find in bank sampah
    const bankSampah = await prisma.bankSampah.findUnique({
      where: { email },
    });

    if (bankSampah) {
      const isValid = await bcrypt.compare(password, bankSampah.password);
      if (isValid) {
        return { type: "bank-sampah", user: bankSampah };
      }
    }

    // If not found in bank sampah, try Person (customer)
    const person = await prisma.person.findUnique({
      where: { email },
    });

    if (person) {
      const isValid = await bcrypt.compare(password, person.password);
      if (!isValid) {
        return null; // Password invalid for person
      }

      // 🔄 NEW: Find ALL active Nasabah relationships for this person
      const nasabahRelationships = await prisma.nasabah.findMany({
        where: {
          personId: person.id,
          isActive: true, // Must be an active relationship
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
        type: "nasabah",
        person: person,
        nasabahRelationships: mappedRelationships,
      };
    }

    // If neither found or password invalid
    return null;
  } catch (error) {
    console.error("Authentication error:", error);
    return null;
  }
}
