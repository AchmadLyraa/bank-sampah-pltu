import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { History } from "lucide-react";
import Pagination from "@/components/pagination";

// 🔧 FIXED: Create specific type for TransaksiTable that matches Prisma result
interface TransaksiWithDetails {
  id: string;
  jenis: "PEMASUKAN" | "PENGELUARAN" | "PENJUALAN_SAMPAH";
  totalNilai: number;
  keterangan: string | null;
  nasabahId: string | null;
  bankSampahId: string;
  createdAt: Date;
  nasabah: { nama: string } | null;
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
  // 🕐 Format datetime with proper timezone handling
  const formatDateTime = (dateString: string | Date) => {
    try {
      const date = new Date(dateString);

      // Using native toLocaleString for consistent local timezone with time
      return date.toLocaleString("id-ID", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      });
    } catch (error) {
      // Fallback
      return new Date(dateString).toLocaleString("id-ID");
    }
  };

  const getTransactionBadge = (jenis: string) => {
    switch (jenis) {
      case "PEMASUKAN":
        return (
          <Badge variant="default" className="bg-green-100 text-green-800">
            Pemasukan
          </Badge>
        );
      case "PENGELUARAN":
        return <Badge variant="destructive">Pengeluaran</Badge>;
      case "PENJUALAN_SAMPAH":
        return <Badge variant="secondary">Penjualan</Badge>;
      default:
        return <Badge variant="outline">{jenis}</Badge>;
    }
  };

  const totalPemasukan = transaksi
    .filter((t) => t.jenis === "PEMASUKAN" || t.jenis === "PENJUALAN_SAMPAH")
    .reduce((sum, t) => sum + t.totalNilai, 0);

  const totalPengeluaran = transaksi
    .filter((t) => t.jenis === "PENGELUARAN")
    .reduce((sum, t) => sum + t.totalNilai, 0);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-green-600">
              Rp {totalPemasukan.toLocaleString()}
            </div>
            <p className="text-sm text-gray-600">
              Total Pemasukan (Halaman Ini)
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-red-600">
              Rp {totalPengeluaran.toLocaleString()}
            </div>
            <p className="text-sm text-gray-600">
              Total Pengeluaran (Halaman Ini)
            </p>
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
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Tanggal</th>
                  <th className="text-left py-3 px-4">Jenis</th>
                  <th className="text-left py-3 px-4">Nasabah</th>
                  <th className="text-left py-3 px-4">Keterangan</th>
                  <th className="text-left py-3 px-4">Detail</th>
                  <th className="text-right py-3 px-4">Nilai</th>
                </tr>
              </thead>
              <tbody>
                {transaksi.map((t) => (
                  <tr key={t.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm">
                      {formatDateTime(t.createdAt)}
                    </td>
                    <td className="py-3 px-4">
                      {getTransactionBadge(t.jenis)}
                    </td>
                    <td className="py-3 px-4">
                      {t.nasabah?.nama || "Bank Sampah"}
                    </td>
                    <td className="py-3 px-4 text-sm">{t.keterangan || "-"}</td>
                    <td className="py-3 px-4 text-sm">
                      {t.detailTransaksi && t.detailTransaksi.length > 0 && (
                        <div className="space-y-1">
                          {t.detailTransaksi.map((detail) => (
                            <div
                              key={detail.id}
                              className="text-xs text-gray-600"
                            >
                              {detail.inventarisSampah?.jenisSampah}:{" "}
                              {detail.beratKg}kg
                            </div>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span
                        className={`font-bold ${
                          t.jenis === "PEMASUKAN" ||
                          t.jenis === "PENJUALAN_SAMPAH"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {t.jenis === "PENGELUARAN" ? "-" : "+"}Rp{" "}
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
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
