import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

import type { BankSampah, AuthenticatedNasabah } from "@/types"; // 🆕 Import AuthenticatedNasabah

// Define the discriminated union type for the authentication result
type AuthenticateResult =
  | { type: "bank-sampah"; user: BankSampah }
  | { type: "nasabah"; user: AuthenticatedNasabah } // 🆕 Use AuthenticatedNasabah here
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
      if (isValid) {
        // 🔄 NEW: Find an active Nasabah relationship for this person
        // For simplicity, we'll take the first active relationship found.
        // In a true multi-tenant system, you might need a selection screen
        // if a person is a customer of multiple banks.
        const nasabahRelationship = await prisma.nasabah.findFirst({
          where: {
            personId: person.id,
            isActive: true, // Must be an active relationship
          },
          include: {
            person: true, // Include person data to satisfy AuthenticatedNasabah
          },
        });

        if (!nasabahRelationship) {
          return {
            error:
              "Akun nasabah Anda tidak ditemukan atau tidak aktif di bank sampah manapun.",
          };
        }

        // The session will now store nasabahRelationship.id as userId
        // Cast to AuthenticatedNasabah because we know 'person' is included
        return {
          type: "nasabah",
          user: nasabahRelationship as AuthenticatedNasabah,
        }; // 🆕 Cast here
      }
    }

    // If neither found or password invalid
    return null;
  } catch (error) {
    console.error("Authentication error:", error);
    return null;
  }
}
