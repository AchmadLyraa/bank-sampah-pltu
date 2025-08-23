"use server";
import { prisma } from "@/lib/prisma";

// 🗓️ UPDATED: Tambah parameter filter tanggal
export async function getLaporanPendapatan(
  bankSampahId: string,
  startDate?: Date,
  endDate?: Date,
) {
  // 📅 Setup date filter
  const dateFilter =
    startDate && endDate
      ? {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        }
      : {};

  console.log("📊 Laporan filter:", {
    bankSampahId,
    startDate: startDate?.toISOString(),
    endDate: endDate?.toISOString(),
    dateFilter,
  });

  // Get all transactions for this bank sampah with date filter
  const [pemasukan, penjualanSampah, pengeluaran] = await Promise.all([
    // Pemasukan dari nasabah (sampah masuk)
    prisma.transaksi.findMany({
      where: {
        bankSampahId,
        jenis: "PEMASUKAN",
        ...dateFilter,
      },
      include: {
        nasabah: { select: { person: { select: { nama: true } } } },
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
        ...dateFilter,
      },
      orderBy: { createdAt: "desc" },
    }),
    // Pengeluaran (penarikan saldo nasabah)
    prisma.transaksi.findMany({
      where: {
        bankSampahId,
        jenis: "PENGELUARAN",
        ...dateFilter,
      },
      include: {
        nasabah: { select: { person: { select: { nama: true } } } },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  // Calculate totals
  const totalPemasukan = pemasukan.reduce((sum, t) => sum + t.totalNilai, 0);
  const totalPenjualan = penjualanSampah.reduce(
    (sum, t) => sum + t.totalNilai,
    0,
  );
  const totalPengeluaran = pengeluaran.reduce(
    (sum, t) => sum + t.totalNilai,
    0,
  );

  // Calculate profit (penjualan - pembelian dari nasabah)
  const keuntungan = totalPenjualan - totalPemasukan;

  // 🆕 PARALLEL QUERIES untuk summary pembelian DAN penjualan
  const [summaryByTypePembelian, summaryByTypePenjualan] = await Promise.all([
    // Summary PEMBELIAN by waste type
    prisma.detailTransaksi.groupBy({
      by: ["inventarisSampahId"],
      where: {
        transaksi: {
          bankSampahId,
          jenis: "PEMASUKAN",
          ...dateFilter,
        },
      },
      _sum: {
        beratKg: true,
        subtotal: true,
      },
      _count: {
        id: true,
      },
    }),
    // 🆕 Summary PENJUALAN by waste type
    prisma.detailTransaksi.groupBy({
      by: ["inventarisSampahId"],
      where: {
        transaksi: {
          bankSampahId,
          jenis: "PENJUALAN_SAMPAH",
          ...dateFilter,
        },
      },
      _sum: {
        beratKg: true,
        subtotal: true,
      },
      _count: {
        id: true,
      },
    }),
  ]);

  // Get waste type names untuk kedua summary
  const allInventarisIds = [
    ...summaryByTypePembelian.map((s) => s.inventarisSampahId),
    ...summaryByTypePenjualan.map((s) => s.inventarisSampahId),
  ];

  const wasteTypes = await prisma.inventarisSampah.findMany({
    where: {
      id: {
        in: [...new Set(allInventarisIds)], // Remove duplicates
      },
    },
    select: {
      id: true,
      jenisSampah: true,
    },
  });

  // 🔄 Format summary PEMBELIAN
  const summaryByType = summaryByTypePembelian.map((summary) => {
    const wasteType = wasteTypes.find(
      (w) => w.id === summary.inventarisSampahId,
    );
    return {
      jenisSampah: wasteType?.jenisSampah || "Unknown",
      totalBerat: summary._sum.beratKg || 0,
      totalNilai: summary._sum.subtotal || 0,
      jumlahTransaksi: summary._count.id,
    };
  });

  // 🆕 Format summary PENJUALAN
  const penjualanSummaryByType = summaryByTypePenjualan.map((summary) => {
    const wasteType = wasteTypes.find(
      (w) => w.id === summary.inventarisSampahId,
    );
    return {
      jenisSampah: wasteType?.jenisSampah || "Unknown",
      totalBerat: summary._sum.beratKg || 0,
      totalNilai: summary._sum.subtotal || 0,
      jumlahTransaksi: summary._count.id,
    };
  });

  return {
    totalPemasukan,
    totalPenjualan,
    totalPengeluaran,
    keuntungan,
    pemasukan,
    penjualanSampah,
    pengeluaran,
    summaryByType: summaryByType, // Pembelian summary
    penjualanSummaryByType: penjualanSummaryByType, // 🆕 Penjualan summary
    filterInfo: {
      startDate,
      endDate,
      totalTransaksi:
        pemasukan.length + penjualanSampah.length + pengeluaran.length,
    },
  };
}
