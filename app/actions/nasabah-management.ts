"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";

export async function getNasabahList(
  bankSampahId: string,
  includeInactive: boolean = false,
) {
  const whereClause = includeInactive
    ? { bankSampahId }
    : { bankSampahId, isActive: true };

  const nasabahList = await prisma.nasabah.findMany({
    where: whereClause,
    include: {
      person: true, // 🆕 Include Person data
    },
    orderBy: { person: { nama: "asc" } }, // Order by person's name
  });

  return nasabahList;
}

export async function createNasabahAction(formData: FormData) {
  const nama = formData.get("nama") as string;
  const alamat = formData.get("alamat") as string;
  const nik = formData.get("nik") as string;
  const telepon = formData.get("telepon") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const bankSampahId = formData.get("bankSampahId") as string;

  try {
    // 1. Check if Person with this email or NIK already exists
    let person = await prisma.person.findFirst({
      where: {
        OR: [{ email }, { nik }],
      },
    });

    // If Person doesn't exist, create a new one
    if (!person) {
      const hashedPassword = await bcrypt.hash(password, 10);
      person = await prisma.person.create({
        data: {
          nama,
          nik,
          alamat,
          telepon,
          email,
          password: hashedPassword,
        },
      });
    } else {
      // If Person exists, but email/NIK is taken by another person, return error
      if (person.email === email && person.id !== person.id) {
        // This check is redundant if email is unique on Person
        return { error: "Email sudah digunakan oleh individu lain." };
      }
      if (person.nik === nik && person.id !== person.id) {
        // This check is redundant if NIK is unique on Person
        return { error: "NIK sudah terdaftar untuk individu lain." };
      }
      // If person exists, but the provided name/address/phone is different,
      // you might want to update the person's details or prompt the user.
      // For now, we'll just use the existing person's data.
    }

    // 2. Check if this Person is already a Nasabah of this Bank Sampah
    const existingNasabahRelationship = await prisma.nasabah.findFirst({
      where: {
        personId: person.id,
        bankSampahId,
      },
    });

    if (existingNasabahRelationship) {
      return {
        error:
          "Individu ini sudah terdaftar sebagai nasabah di bank sampah ini.",
      };
    }

    // 3. Create the Nasabah relationship
    await prisma.nasabah.create({
      data: {
        personId: person.id,
        bankSampahId,
        saldo: 0,
        isActive: true,
      },
    });

    revalidatePath("/bank-sampah/nasabah");
    return { success: true };
  } catch (error: any) {
    console.error("Error creating nasabah:", error);
    // Handle unique constraint errors for Person model
    if (error.code === "P2002" && error.meta?.target?.includes("email")) {
      return { error: "Email sudah digunakan oleh individu lain." };
    }
    if (error.code === "P2002" && error.meta?.target?.includes("nik")) {
      return { error: "NIK sudah terdaftar untuk individu lain." };
    }
    return { error: "Terjadi kesalahan saat membuat akun nasabah" };
  }
}

// 🔄 MODIFIED: toggleNasabahStatusAction to operate on Nasabah relationship
export async function toggleNasabahStatusAction(formData: FormData) {
  const id = formData.get("id") as string; // This is the Nasabah relationship ID
  const isActive = formData.get("isActive") === "true";

  try {
    await prisma.nasabah.update({
      where: { id },
      data: {
        isActive: !isActive, // Toggle status of the relationship
      },
    });

    revalidatePath("/bank-sampah/nasabah");
    revalidatePath("/bank-sampah/penimbangan");
    revalidatePath("/bank-sampah/penarikan");
    return { success: true };
  } catch (error) {
    console.error("Error toggling nasabah status:", error);
    return { error: "Terjadi kesalahan saat mengubah status nasabah" };
  }
}
