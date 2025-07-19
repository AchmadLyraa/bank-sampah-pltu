"use server"

import { prisma } from "@/lib/prisma"

export async function getNasabahData(nasabahId: string) {
  const nasabah = await prisma.nasabah.findUnique({
    where: { id: nasabahId },
  })

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
  })

  return { nasabah, transaksi }
}
