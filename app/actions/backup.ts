"use server";

import { prisma } from "@/lib/prisma";

export async function getBackupData(bankSampahId: string) {
  try {
    // 📊 Get all data for backup
    const [bankSampah, nasabahList, inventarisList, transaksiList] =
      await Promise.all([
        // Bank Sampah Info
        prisma.bankSampah.findUnique({
          where: { id: bankSampahId },
          select: {
            nama: true,
            alamat: true,
            telepon: true,
            email: true,
          },
        }),

        // Nasabah dengan saldo - 🔄 FIXED: Include person data and select from person
        prisma.nasabah.findMany({
          where: { bankSampahId },
          select: {
            saldo: true,
            createdAt: true,
            person: {
              // 🆕 Include the related Person data
              select: {
                nama: true,
                email: true,
                telepon: true,
                alamat: true,
              },
            },
          },
          orderBy: { person: { nama: "asc" } }, // 🔄 FIXED: Order by person's name
        }),

        // Inventaris sampah
        prisma.inventarisSampah.findMany({
          where: { bankSampahId },
          select: {
            jenisSampah: true,
            hargaPerKg: true,
            stokKg: true,
            isActive: true,
            createdAt: true,
          },
          orderBy: { jenisSampah: "asc" },
        }),

        // Summary transaksi
        prisma.transaksi.findMany({
          where: { bankSampahId },
          select: {
            jenis: true,
            totalNilai: true,
            createdAt: true,
          },
          orderBy: { createdAt: "desc" },
          take: 100, // Last 100 transactions
        }),
      ]);

    // 📈 Calculate summaries
    const totalNasabah = nasabahList.length;
    const totalSaldo = nasabahList.reduce((sum, n) => sum + n.saldo, 0);
    const totalStok = inventarisList.reduce((sum, i) => sum + i.stokKg, 0);
    const totalNilaiInventaris = inventarisList.reduce(
      (sum, i) => sum + i.stokKg * i.hargaPerKg,
      0,
    );

    const transaksiSummary = {
      totalPemasukan: transaksiList
        .filter((t) => t.jenis === "PEMASUKAN")
        .reduce((sum, t) => sum + t.totalNilai, 0),
      totalPenjualan: transaksiList
        .filter((t) => t.jenis === "PENJUALAN_SAMPAH")
        .reduce((sum, t) => sum + t.totalNilai, 0),
      totalPengeluaran: transaksiList
        .filter((t) => t.jenis === "PENGELUARAN")
        .reduce((sum, t) => sum + t.totalNilai, 0),
    };

    return {
      bankSampah,
      nasabahList,
      inventarisList,
      transaksiList,
      summary: {
        totalNasabah,
        totalSaldo,
        totalStok,
        totalNilaiInventaris,
        ...transaksiSummary,
        keuntungan:
          transaksiSummary.totalPenjualan - transaksiSummary.totalPemasukan,
      },
      generatedAt: new Date(),
    };
  } catch (error) {
    console.error("Error getting backup data:", error);
    throw new Error("Gagal mengambil data backup");
  }
}
