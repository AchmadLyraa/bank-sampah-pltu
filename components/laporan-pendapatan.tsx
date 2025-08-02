import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Package,
  ArrowUpDown,
  Calendar,
} from "lucide-react";
import { DateTime } from "luxon";

interface LaporanPendapatanProps {
  data: {
    totalPemasukan: number;
    totalPenjualan: number;
    totalPengeluaran: number;
    keuntungan: number;
    pemasukan: any[];
    penjualanSampah: any[];
    pengeluaran: any[];
    summaryByType: {
      jenisSampah: string;
      totalBerat: number;
      totalNilai: number;
      jumlahTransaksi: number;
    }[];
    // 🗓️ NEW: Filter info
    filterInfo?: {
      startDate?: Date | null;
      endDate?: Date | null;
      totalTransaksi: number;
    };
  };
}

export default function LaporanPendapatan({ data }: LaporanPendapatanProps) {
  const {
    totalPemasukan,
    totalPenjualan,
    totalPengeluaran,
    keuntungan,
    pemasukan,
    penjualanSampah,
    pengeluaran,
    summaryByType,
    filterInfo,
  } = data;

  // 📅 Format filter info
  const getFilterText = () => {
    if (!filterInfo?.startDate || !filterInfo?.endDate) {
      return "Semua Data";
    }

    const start = new Date(filterInfo.startDate).toLocaleDateString("id-ID");
    const end = new Date(filterInfo.endDate).toLocaleDateString("id-ID");

    if (start === end) {
      return `Tanggal: ${start}`;
    }

    return `Periode: ${start} - ${end}`;
  };

  return (
    <div className="space-y-6">
      {/* 🗓️ Filter Info Banner */}
      {filterInfo && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">
                  📊 {getFilterText()}
                </span>
              </div>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                {filterInfo.totalTransaksi} Transaksi
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pembelian dari Nasabah
            </CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              Rp {totalPemasukan.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Total pengeluaran untuk beli sampah
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Penjualan ke Pihak Ketiga
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              Rp {totalPenjualan.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Total pemasukan dari jual sampah
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Penarikan Nasabah
            </CardTitle>
            <ArrowUpDown className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              Rp {totalPengeluaran.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Total saldo yang ditarik nasabah
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Keuntungan Bersih
            </CardTitle>
            <DollarSign
              className={`h-4 w-4 ${keuntungan >= 0 ? "text-green-600" : "text-red-600"}`}
            />
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${keuntungan >= 0 ? "text-green-600" : "text-red-600"}`}
            >
              Rp {keuntungan.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Penjualan - Pembelian
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Summary by Waste Type */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Ringkasan per Jenis Sampah
          </CardTitle>
        </CardHeader>
        <CardContent>
          {summaryByType.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Tidak ada data untuk periode yang dipilih</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Jenis Sampah</th>
                    <th className="text-left py-3 px-4">Total Berat (kg)</th>
                    <th className="text-left py-3 px-4">
                      Total Nilai Pembelian
                    </th>
                    <th className="text-left py-3 px-4">Jumlah Transaksi</th>
                    <th className="text-left py-3 px-4">Rata-rata Harga/kg</th>
                  </tr>
                </thead>
                <tbody>
                  {summaryByType.map((item, index) => (
                    <tr key={index} className="border-b">
                      <td className="py-3 px-4 font-medium">
                        {item.jenisSampah}
                      </td>
                      <td className="py-3 px-4">
                        {item.totalBerat.toFixed(1)} kg
                      </td>
                      <td className="py-3 px-4">
                        Rp {item.totalNilai.toLocaleString()}
                      </td>
                      <td className="py-3 px-4">{item.jumlahTransaksi}</td>
                      <td className="py-3 px-4">
                        Rp{" "}
                        {item.totalBerat > 0
                          ? Math.round(
                              item.totalNilai / item.totalBerat,
                            ).toLocaleString()
                          : 0}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Sales */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Penjualan Terbaru ({penjualanSampah.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {penjualanSampah.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  Tidak ada penjualan untuk periode ini
                </p>
              ) : (
                penjualanSampah.slice(0, 10).map((transaksi) => (
                  <div
                    key={transaksi.id}
                    className="flex justify-between items-center p-3 border rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-sm">
                        {transaksi.keterangan}
                      </p>
                      <p className="text-xs text-gray-500">
                        {DateTime.fromJSDate(new Date(transaksi.createdAt))
                          .setZone(
                            Intl.DateTimeFormat().resolvedOptions().timeZone,
                          )
                          .toFormat("dd/MM/yyyy HH:mm")}
                      </p>
                    </div>
                    <Badge
                      variant="default"
                      className="bg-green-100 text-green-800"
                    >
                      +Rp {transaksi.totalNilai.toLocaleString()}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Purchases */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-red-600" />
              Pembelian Terbaru ({pemasukan.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {pemasukan.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  Tidak ada pembelian untuk periode ini
                </p>
              ) : (
                pemasukan.slice(0, 10).map((transaksi) => (
                  <div
                    key={transaksi.id}
                    className="flex justify-between items-center p-3 border rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-sm">
                        {transaksi.nasabah?.nama}
                      </p>
                      <p className="text-xs text-gray-500">
                        {DateTime.fromJSDate(new Date(transaksi.createdAt))
                          .setZone(
                            Intl.DateTimeFormat().resolvedOptions().timeZone,
                          )
                          .toFormat("dd/MM/yyyy HH:mm")}
                      </p>
                      {transaksi.detailTransaksi && (
                        <p className="text-xs text-gray-600">
                          {transaksi.detailTransaksi
                            .map(
                              (d: any) =>
                                `${d.inventarisSampah.jenisSampah} (${d.beratKg}kg)`,
                            )
                            .join(", ")}
                        </p>
                      )}
                    </div>
                    <Badge variant="destructive">
                      -Rp {transaksi.totalNilai.toLocaleString()}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
