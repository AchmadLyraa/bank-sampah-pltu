"use server"

import { prisma } from "@/lib/prisma"

export async function getLaporanPendapatan(bankSampahId: string) {
  // Get all transactions for this bank sampah
  const [pemasukan, penjualanSampah, pengeluaran] = await Promise.all([
    // Pemasukan dari nasabah (sampah masuk)
    prisma.transaksi.findMany({
      where: {
        bankSampahId,
        jenis: "PEMASUKAN",
      },
      include: {
        nasabah: { select: { nama: true } },
        detailTransaksi: {
          include: {
            inventarisSampah: { select: { jenisSampah: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),

    // Penjualan sampah ke pihak ketiga (sampah keluar)
    prisma.transaksi.findMany({
      where: {
        bankSampahId,
        jenis: "PENJUALAN_SAMPAH",
      },
      orderBy: { createdAt: "desc" },
    }),

    // Pengeluaran (penarikan saldo nasabah)
    prisma.transaksi.findMany({
      where: {
        bankSampahId,
        jenis: "PENGELUARAN",
      },
      include: {
        nasabah: { select: { nama: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
  ])

  // Calculate totals
  const totalPemasukan = pemasukan.reduce((sum, t) => sum + t.totalNilai, 0)
  const totalPenjualan = penjualanSampah.reduce((sum, t) => sum + t.totalNilai, 0)
  const totalPengeluaran = pengeluaran.reduce((sum, t) => sum + t.totalNilai, 0)

  // Calculate profit (penjualan - pembelian dari nasabah)
  const keuntungan = totalPenjualan - totalPemasukan

  // Get summary by waste type
  const summaryByType = await prisma.detailTransaksi.groupBy({
    by: ["inventarisSampahId"],
    where: {
      transaksi: {
        bankSampahId,
        jenis: "PEMASUKAN",
      },
    },
    _sum: {
      beratKg: true,
      subtotal: true,
    },
    _count: {
      id: true,
    },
  })

  // Get waste type names
  const wasteTypes = await prisma.inventarisSampah.findMany({
    where: {
      id: {
        in: summaryByType.map((s) => s.inventarisSampahId),
      },
    },
    select: {
      id: true,
      jenisSampah: true,
    },
  })

  const summaryWithNames = summaryByType.map((summary) => {
    const wasteType = wasteTypes.find((w) => w.id === summary.inventarisSampahId)
    return {
      jenisSampah: wasteType?.jenisSampah || "Unknown",
      totalBerat: summary._sum.beratKg || 0,
      totalNilai: summary._sum.subtotal || 0,
      jumlahTransaksi: summary._count.id,
    }
  })

  return {
    totalPemasukan,
    totalPenjualan,
    totalPengeluaran,
    keuntungan,
    pemasukan,
    penjualanSampah,
    pengeluaran,
    summaryByType: summaryWithNames,
  }
}
