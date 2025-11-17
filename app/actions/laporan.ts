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
            inventarisSampah: { select: { jenisSampah: true, satuan: true } },
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
    prisma.detailTransaksi.findMany({
      where: {
        transaksi: {
          bankSampahId,
          jenis: "PEMASUKAN",
          ...dateFilter,
        },
      },
      include: {
        inventarisSampah: {
          select: {
            id: true,
            jenisSampah: true,
            satuan: true,
          },
        },
      },
    }),
    // 🆕 Summary PENJUALAN by waste type
    prisma.detailTransaksi.findMany({
      where: {
        transaksi: {
          bankSampahId,
          jenis: "PENJUALAN_SAMPAH",
          ...dateFilter,
        },
      },
      include: {
        inventarisSampah: {
          select: {
            id: true,
            jenisSampah: true,
            satuan: true,
          },
        },
      },
    }),
  ]);

  // Get waste type names untuk kedua summary
  // 🔄 Group by inventaris untuk pembelian
  const summaryByTypeMap = new Map<string, any>();
  summaryByTypePembelian.forEach((detail) => {
    const key = detail.inventarisSampahId;
    if (!summaryByTypeMap.has(key)) {
      summaryByTypeMap.set(key, {
        jenisSampah: detail.inventarisSampah?.jenisSampah || "Unknown",
        satuan: detail.inventarisSampah?.satuan || "kg",
        totalBerat: 0,
        totalNilai: 0,
        jumlahTransaksi: 0,
      });
    }
    const item = summaryByTypeMap.get(key)!;
    item.totalBerat += detail.jumlahUnit;
    item.totalNilai += detail.subtotal;
    item.jumlahTransaksi += 1;
  });
  const summaryByType = Array.from(summaryByTypeMap.values());

  // 🆕 Group by inventaris untuk penjualan
  const penjualanSummaryMap = new Map<string, any>();
  summaryByTypePenjualan.forEach((detail) => {
    const key = detail.inventarisSampahId;
    if (!penjualanSummaryMap.has(key)) {
      penjualanSummaryMap.set(key, {
        jenisSampah: detail.inventarisSampah?.jenisSampah || "Unknown",
        satuan: detail.inventarisSampah?.satuan || "kg",
        totalBerat: 0,
        totalNilai: 0,
        jumlahTransaksi: 0,
      });
    }
    const item = penjualanSummaryMap.get(key)!;
    item.totalBerat += detail.jumlahUnit;
    item.totalNilai += detail.subtotal;
    item.jumlahTransaksi += 1;
  });
  const penjualanSummaryByType = Array.from(penjualanSummaryMap.values());

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
