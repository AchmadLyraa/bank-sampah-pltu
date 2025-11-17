"use server";

import { prisma } from "@/lib/prisma";

// 🆕 NEW: Function to get all dashboard data for a specific nasabah relationship
export async function getNasabahDashboardData(
  personId: string,
  bankSampahId: string,
) {
  // 1. Find the specific Nasabah relationship for this person and bank sampah
  const nasabahRelationship = await prisma.nasabah.findUnique({
    where: {
      personId_bankSampahId: {
        personId: personId,
        bankSampahId: bankSampahId,
      },
    },
    include: {
      person: true, // Include person data
      bankSampah: true, // Include bank sampah data
    },
  });

  if (!nasabahRelationship) {
    return {
      nasabah: null,
      transaksi: [],
      inventarisList: [],
      error: "Hubungan nasabah tidak ditemukan untuk bank sampah ini.",
    };
  }

  // 2. Get transactions for this specific nasabah relationship
  // di getNasabahDashboardData — transaksi query
  const transaksi = await prisma.transaksi.findMany({
    where: { nasabahId: nasabahRelationship.id },
    include: {
      detailTransaksi: {
        include: {
          inventarisSampah: {
            select: { jenisSampah: true, satuan: true, hargaPerUnit: true },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // 3. Get active inventaris for this bank sampah
  const inventarisList = await prisma.inventarisSampah.findMany({
    where: {
      bankSampahId: bankSampahId,
      isActive: true, // Only active items
    },
    orderBy: { jenisSampah: "asc" },
  });

  return {
    nasabah: nasabahRelationship, // This is the specific Nasabah relationship
    transaksi,
    inventarisList,
    error: null,
  };
}
