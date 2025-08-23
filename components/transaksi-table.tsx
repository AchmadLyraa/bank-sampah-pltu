"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { History } from "lucide-react";
import Pagination from "@/components/pagination";
import { useEffect, useState } from "react";

// 🔧 FIXED: Create specific type for TransaksiTable that matches Prisma result
interface TransaksiWithDetails {
  id: string;
  jenis:
    | "PEMASUKAN"
    | "PENGELUARAN"
    | "PENJUALAN_SAMPAH"
    | "PEMASUKAN_UMUM"
    | "PENGELUARAN_UMUM";
  totalNilai: number;
  keterangan: string | null;
  nasabahId: string | null;
  bankSampahId: string;
  createdAt: Date;
  nasabah: { person: { nama: string } } | null;
  detailTransaksi: {
    id: string;
    transaksiId: string;
    inventarisSampahId: string;
    beratKg: number;
    hargaPerKg: number;
    subtotal: number;
    createdAt: Date;
    inventarisSampah: { jenisSampah: string } | null;
  }[];
}

interface TransaksiTableProps {
  transaksi: TransaksiWithDetails[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
}

export default function TransaksiTable({
  transaksi,
  currentPage,
  totalPages,
  totalItems,
}: TransaksiTableProps) {
  const [isClient, setIsClient] = useState(false);
  const [userTimezone, setUserTimezone] = useState<string>("UTC");

  useEffect(() => {
    setIsClient(true);
    setUserTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone);
  }, []);

  const formatDateTime = (dateString: string | Date) => {
    if (!isClient) return "Loading...";
    try {
      const date = new Date(dateString);
      return date.toLocaleString("id-ID", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        timeZone: userTimezone,
        hour12: false,
      });
    } catch (error) {
      console.error("❌ Date formatting error (TransaksiTable):", error);
      return new Date(dateString).toLocaleString("id-ID");
    }
  };

  const getTransactionBadge = (jenis: TransaksiWithDetails["jenis"]) => {
    switch (jenis) {
      case "PEMASUKAN":
        return <Badge className="bg-green-100 text-green-800">Pemasukan</Badge>;
      case "PEMASUKAN_UMUM":
        return <Badge className="bg-green-50 text-green-700">Pemasukan Umum</Badge>;
      case "PENGELUARAN":
        return <Badge variant="destructive">Pengeluaran</Badge>;
      case "PENGELUARAN_UMUM":
        return <Badge className="bg-red-50 text-red-700">Pengeluaran Umum</Badge>;
      case "PENJUALAN_SAMPAH":
        return <Badge variant="secondary">Penjualan</Badge>;
      default:
        return <Badge variant="outline">{jenis}</Badge>;
    }
  };

  // ✅ Hitung total per kategori (halaman ini)
  const totalPemasukan = transaksi
    .filter((t) =>
      ["PEMASUKAN", "PENJUALAN_SAMPAH", "PEMASUKAN_UMUM"].includes(t.jenis)
    )
    .reduce((sum, t) => sum + t.totalNilai, 0);

  const totalPengeluaran = transaksi
    .filter((t) => ["PENGELUARAN", "PENGELUARAN_UMUM"].includes(t.jenis))
    .reduce((sum, t) => sum + t.totalNilai, 0);

  if (!isClient) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-gray-400">Loading...</div>
              <p className="text-sm text-gray-600">Total Pemasukan (Halaman Ini)</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-gray-400">Loading...</div>
              <p className="text-sm text-gray-600">Total Pengeluaran (Halaman Ini)</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-gray-400">Loading...</div>
              <p className="text-sm text-gray-600">Selisih (Halaman Ini)</p>
            </CardContent>
          </Card>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Loading Transaksi...
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <p className="text-gray-500">Loading timezone...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-green-600">
              Rp {totalPemasukan.toLocaleString()}
            </div>
            <p className="text-sm text-gray-600">Total Pemasukan (Halaman Ini)</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-red-600">
              Rp {totalPengeluaran.toLocaleString()}
            </div>
            <p className="text-sm text-gray-600">Total Pengeluaran (Halaman Ini)</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-blue-600">
              Rp {(totalPemasukan - totalPengeluaran).toLocaleString()}
            </div>
            <p className="text-sm text-gray-600">Selisih (Halaman Ini)</p>
          </CardContent>
        </Card>
      </div>

      {/* Transaction Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Transaksi (Halaman {currentPage} dari {totalPages})
          </CardTitle>
          <p className="text-xs text-gray-400">Timezone: {userTimezone}</p>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Tanggal</th>
                  <th className="text-left py-3 px-4">Jenis</th>
                  <th className="text-left py-3 px-4">User</th>
                  <th className="text-left py-3 px-4">Keterangan</th>
                  <th className="text-left py-3 px-4">Detail</th>
                  <th className="text-right py-3 px-4">Nilai</th>
                </tr>
              </thead>
              <tbody>
                {transaksi.map((t) => (
                  <tr key={t.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm">{formatDateTime(t.createdAt)}</td>
                    <td className="py-3 px-4">{getTransactionBadge(t.jenis)}</td>
                    <td className="py-3 px-4">{t.nasabah?.person?.nama || "Bank Sampah"}</td>
                    <td className="py-3 px-4 text-sm">{t.keterangan || "-"}</td>
                    <td className="py-3 px-4 text-sm">
                      {t.detailTransaksi && t.detailTransaksi.length > 0 && (
                        <div className="space-y-1">
                          {t.detailTransaksi.map((detail) => (
                            <div key={detail.id} className="text-xs text-gray-600">
                              {detail.inventarisSampah?.jenisSampah}: {detail.beratKg}kg
                            </div>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span
                        className={`font-bold ${
                          ["PEMASUKAN", "PENJUALAN_SAMPAH", "PEMASUKAN_UMUM"].includes(t.jenis)
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {["PENGELUARAN", "PENGELUARAN_UMUM"].includes(t.jenis) ? "-" : "+"}Rp{" "}
                        {t.totalNilai.toLocaleString()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 📄 Pagination Component */}
          <div className="mt-6 pt-6 border-t">
            <Pagination currentPage={currentPage} totalPages={totalPages} totalItems={totalItems} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
