"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";

export async function createInventarisAction(formData: FormData) {
  const jenisSampah = formData.get("jenisSampah") as string;
  const hargaPerKg = Number.parseFloat(formData.get("hargaPerKg") as string);
  const bankSampahId = formData.get("bankSampahId") as string;

  try {
    // Check if jenis sampah already exists for this bank sampah
    const existingInventaris = await prisma.inventarisSampah.findFirst({
      where: {
        jenisSampah: {
          equals: jenisSampah,
          mode: "insensitive",
        },
        bankSampahId,
      },
    });

    if (existingInventaris) {
      return { error: "Jenis sampah sudah ada dalam inventaris" };
    }

    // Create inventaris
    await prisma.inventarisSampah.create({
      data: {
        jenisSampah,
        hargaPerKg,
        stokKg: 0,
        isActive: true, // 🆕 Default active
        bankSampahId,
      },
    });

    revalidatePath("/bank-sampah/inventaris");
    return { success: true };
  } catch (error) {
    console.error("Error creating inventaris:", error);
    return { error: "Terjadi kesalahan saat menambahkan jenis sampah" };
  }
}

export async function deleteInventarisAction(formData: FormData) {
  const id = formData.get("id") as string;

  try {
    // Check if inventaris exists and has zero stock
    const inventaris = await prisma.inventarisSampah.findUnique({
      where: { id },
    });

    if (!inventaris) {
      return { error: "Inventaris tidak ditemukan" };
    }

    if (inventaris.stokKg > 0) {
      return {
        error: "Tidak dapat menghapus jenis sampah yang masih memiliki stok",
      };
    }

    // Check if there are any detail transaksi related to this inventaris
    const relatedTransaksi = await prisma.detailTransaksi.findFirst({
      where: { inventarisSampahId: id },
    });

    if (relatedTransaksi) {
      return {
        error:
          "Tidak dapat menghapus jenis sampah yang sudah memiliki riwayat transaksi",
      };
    }

    // Delete inventaris
    await prisma.inventarisSampah.delete({
      where: { id },
    });

    revalidatePath("/bank-sampah/inventaris");
    return { success: true };
  } catch (error) {
    console.error("Error deleting inventaris:", error);
    return { error: "Terjadi kesalahan saat menghapus jenis sampah" };
  }
}

// 🆕 NEW: Toggle active/inactive status
export async function toggleInventarisStatusAction(formData: FormData) {
  const id = formData.get("id") as string;
  const isActive = formData.get("isActive") === "true";

  try {
    await prisma.inventarisSampah.update({
      where: { id },
      data: { isActive: !isActive }, // Toggle status
    });

    revalidatePath("/bank-sampah/inventaris");
    revalidatePath("/bank-sampah/penimbangan"); // Refresh penimbangan page too
    return { success: true };
  } catch (error) {
    console.error("Error toggling inventaris status:", error);
    return { error: "Terjadi kesalahan saat mengubah status" };
  }
}

// Updated server actions with edit functionality
export async function getInventarisAlat(bankSampahId: string) {
  return prisma.inventarisAlat.findMany({
    where: { bankSampahId },
    orderBy: { createdAt: "desc" },
  });
}

export async function addInventarisAlat(data: {
  nama: string;
  jenis: string;
  merk?: string;
  kondisi: string;
  hargaBeli: number;
  metodePerolehan: string;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.userType !== "bank-sampah") {
    throw new Error("Unauthorized");
  }
  return prisma.inventarisAlat.create({
    data: {
      ...data,
      bankSampahId: session.user.id,
    },
  });
}

// 🆕 NEW: Edit functionality
export async function updateInventarisAlat(id: string, data: {
  nama: string;
  jenis: string;
  merk?: string;
  kondisi: string;
  hargaBeli: number;
  metodePerolehan: string;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.userType !== "bank-sampah") {
    throw new Error("Unauthorized");
  }

  // Verify that the inventaris belongs to the current bank
  const inventaris = await prisma.inventarisAlat.findUnique({
    where: { id },
    select: { bankSampahId: true },
  });

  if (!inventaris || inventaris.bankSampahId !== session.user.id) {
    throw new Error("Inventaris not found or unauthorized");
  }

  return prisma.inventarisAlat.update({
    where: { id },
    data,
  });
}

// 🆕 NEW: Get single inventaris for editing
export async function getInventarisAlatById(id: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.userType !== "bank-sampah") {
    throw new Error("Unauthorized");
  }

  const inventaris = await prisma.inventarisAlat.findUnique({
    where: { id },
  });

  if (!inventaris || inventaris.bankSampahId !== session.user.id) {
    throw new Error("Inventaris not found or unauthorized");
  }

  return inventaris;
}

export async function deleteInventarisAlat(id: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.userType !== "bank-sampah") {
    throw new Error("Unauthorized");
  }
  return prisma.inventarisAlat.delete({
    where: { id },
  });
}
