"use server";

import { prisma } from "@/lib/prisma";

// 🔄 MODIFIED: getNasabahData to fetch Person data via Nasabah relationship
export async function getNasabahData(nasabahId: string) {
  // nasabahId here is the ID of the Nasabah relationship
  const nasabah = await prisma.nasabah.findUnique({
    where: { id: nasabahId },
    include: {
      person: true, // 🆕 Include Person data
    },
  });

  if (!nasabah) {
    return { nasabah: null, transaksi: [] }; // Handle case where relationship not found
  }

  const transaksi = await prisma.transaksi.findMany({
    where: { nasabahId },
    include: {
      detailTransaksi: {
        include: {
          inventarisSampah: { select: { jenisSampah: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return { nasabah, transaksi };
}
