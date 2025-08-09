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
    orderBy: { nama: "asc" },
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
    // Check if email already exists
    const existingNasabah = await prisma.nasabah.findUnique({
      where: { email },
    });

    if (existingNasabah) {
      return { error: "Email sudah digunakan" };
    }
    // 🆕 Check if NIK already exists
    // const existingNIK = await prisma.nasabah.findFirst({
    //   where: { nik },
    // });

    // if (existingNIK) {
    //   return { error: "NIK sudah terdaftar" };
    // }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create nasabah
    await prisma.nasabah.create({
      data: {
        nama,
        nik,
        alamat,
        telepon,
        email,
        password: hashedPassword,
        saldo: 0,
        isActive: true,
        bankSampahId,
      },
    });

    revalidatePath("/bank-sampah/nasabah");
    return { success: true };
  } catch (error) {
    console.error("Error creating nasabah:", error);
    return { error: "Terjadi kesalahan saat membuat akun nasabah" };
  }
}

export async function toggleNasabahStatusAction(formData: FormData) {
  const id = formData.get("id") as string;
  const isActive = formData.get("isActive") === "true";

  try {
    await prisma.nasabah.update({
      where: { id },
      data: { isActive: !isActive }, // Toggle status
    });

    revalidatePath("/bank-sampah/nasabah");
    revalidatePath("/bank-sampah/penimbangan"); // Refresh penimbangan page too
    revalidatePath("/bank-sampah/penarikan");
    return { success: true };
  } catch (error) {
    console.error("Error toggling nasabah status:", error);
    return { error: "Terjadi kesalahan saat mengubah status nasabah" };
  }
}
