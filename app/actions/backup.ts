"use server";

import { prisma } from "@/lib/prisma";

type RingkasanItem = {
  jenisSampah: string;
  satuan: string;
  totalBerat: number;
  totalNilai: number;
  jumlahTransaksi: number;
  rataHarga: number;
};

export async function getBackupData(bankSampahId: string) {
  try {
    // 📊 Get all data for backup (TIDAK DIUBAH)
    const [bankSampah, nasabahList, inventarisList, transaksiList] =
      await Promise.all([
        // Bank Sampah Info
        prisma.bankSampah.findUnique({
          where: { id: bankSampahId },
          select: { nama: true, alamat: true, telepon: true, email: true },
        }),

        // Nasabah dengan saldo - 🔄 FIXED: Include person data and select from person
        prisma.nasabah.findMany({
          where: { bankSampahId },
          select: {
            saldo: true,
            createdAt: true,
            person: {
              select: { nama: true, email: true, telepon: true, alamat: true },
            },
          },
          orderBy: { person: { nama: "asc" } },
        }),

        // Inventaris sampah
        prisma.inventarisSampah.findMany({
          where: { bankSampahId },
          select: {
            id: true,
            jenisSampah: true,
            satuan: true,
            hargaPerUnit: true,
            stokUnit: true,
            isActive: true,
            createdAt: true,
          },
          orderBy: { jenisSampah: "asc" },
        }),

        // Summary transaksi
        prisma.transaksi.findMany({
          where: { bankSampahId },
          select: { jenis: true, totalNilai: true, createdAt: true },
          orderBy: { createdAt: "desc" },
          take: 100,
        }),
      ]);

    // 📈 Summary dasar (TIDAK DIUBAH)
    const totalNasabah = nasabahList.length;
    const totalSaldo = nasabahList.reduce((sum, n) => sum + n.saldo, 0);
    const totalStok = inventarisList.reduce((sum, i) => sum + i.stokUnit, 0);
    const totalNilaiInventaris = inventarisList.reduce(
      (sum, i) => sum + i.stokUnit * i.hargaPerUnit,
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

    // 🆕 FIX UTAMA: Ambil detailTransaksi lalu agregasi manual (lebih robust dari groupBy yang bisa kosong)
    const [penjualanDetail, pembelianDetail, totalsFallback] =
      await Promise.all([
        prisma.detailTransaksi.findMany({
          where: { transaksi: { bankSampahId, jenis: "PENJUALAN_SAMPAH" } },
          select: {
            inventarisSampahId: true,
            jumlahUnit: true,
            subtotal: true,
            inventarisSampah: {
              select: { satuan: true },
            },
          },
        }),
        prisma.detailTransaksi.findMany({
          where: { transaksi: { bankSampahId, jenis: "PEMASUKAN" } },
          select: {
            inventarisSampahId: true,
            jumlahUnit: true,
            subtotal: true,
            inventarisSampah: {
              select: { satuan: true },
            },
          },
        }),
        // 🆕 Fallback total transaksi jika detail kosong
        prisma.transaksi.groupBy({
          by: ["jenis"],
          where: {
            bankSampahId,
            jenis: { in: ["PEMASUKAN", "PENJUALAN_SAMPAH"] },
          },
          _sum: { totalNilai: true },
          _count: { _all: true },
        }),
      ]);

    // 🆕 Map inventaris untuk cari nama jenis dengan cepat
    const invMap = new Map(inventarisList.map((i) => [i.id, i.jenisSampah]));

    // 🆕 Helper agregasi manual
    function aggregate(
      details: {
        inventarisSampahId: string;
        jumlahUnit: number;
        subtotal: number;
        inventarisSampah: { satuan: string } | null;
      }[],
    ): RingkasanItem[] {
      const acc = new Map<
        string,
        {
          totalBerat: number;
          totalNilai: number;
          count: number;
          satuan: string;
        }
      >();
      for (const row of details) {
        const key = row.inventarisSampahId;
        const prev = acc.get(key) || {
          totalBerat: 0,
          totalNilai: 0,
          count: 0,
          satuan: row.inventarisSampah?.satuan || "KG",
        };
        prev.totalBerat += row.jumlahUnit || 0;
        prev.totalNilai += row.subtotal || 0;
        prev.count += 1;
        acc.set(key, prev);
      }
      return Array.from(acc.entries()).map(([id, v]) => ({
        jenisSampah: invMap.get(id) || "Unknown",
        satuan: v.satuan,
        totalBerat: v.totalBerat,
        totalNilai: v.totalNilai,
        jumlahTransaksi: v.count,
        rataHarga: v.totalBerat > 0 ? v.totalNilai / v.totalBerat : 0,
      }));
    }

    // 🆕 Agregasi utama
    let penjualanSummary: RingkasanItem[] = aggregate(penjualanDetail);
    let pembelianSummary: RingkasanItem[] = aggregate(pembelianDetail);

    // 🆕 Fallback jika detail kosong namun ada transaksi (hindari tabel kosong)
    if (penjualanSummary.length === 0) {
      const f = totalsFallback.find((x) => x.jenis === "PENJUALAN_SAMPAH");
      if (f && (f._sum?.totalNilai ?? 0) > 0) {
        penjualanSummary = [
          {
            jenisSampah: "Semua Jenis",
            satuan: "KG",
            totalBerat: 0,
            totalNilai: f._sum?.totalNilai || 0,
            jumlahTransaksi: f._count?._all || 0,
            rataHarga: 0,
          },
        ];
      }
    }

    if (pembelianSummary.length === 0) {
      const f = totalsFallback.find((x) => x.jenis === "PEMASUKAN");
      if (f && (f._sum?.totalNilai ?? 0) > 0) {
        pembelianSummary = [
          {
            jenisSampah: "Semua Jenis",
            satuan: "KG",
            totalBerat: 0,
            totalNilai: f._sum?.totalNilai || 0,
            jumlahTransaksi: f._count?._all || 0,
            rataHarga: 0,
          },
        ];
      }
    }

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
      // 🆕 Kirim dua ringkasan yang sudah dipastikan tidak kosong jika ada transaksi
      penjualanSummary,
      pembelianSummary,
      generatedAt: new Date(),
    };
  } catch (error) {
    console.error("Error getting backup data:", error);
    throw new Error("Gagal mengambil data backup");
  }
}
