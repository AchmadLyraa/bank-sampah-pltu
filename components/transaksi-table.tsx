import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { History } from "lucide-react"
import type { Transaksi } from "@/types"

interface TransaksiTableProps {
  transaksi: Transaksi[]
}

export default function TransaksiTable({ transaksi }: TransaksiTableProps) {
  const getTransactionBadge = (jenis: string) => {
    switch (jenis) {
      case "PEMASUKAN":
        return (
          <Badge variant="default" className="bg-green-100 text-green-800">
            Pemasukan
          </Badge>
        )
      case "PENGELUARAN":
        return <Badge variant="destructive">Pengeluaran</Badge>
      case "PENJUALAN_SAMPAH":
        return <Badge variant="secondary">Penjualan</Badge>
      default:
        return <Badge variant="outline">{jenis}</Badge>
    }
  }

  const totalPemasukan = transaksi
    .filter((t) => t.jenis === "PEMASUKAN" || t.jenis === "PENJUALAN_SAMPAH")
    .reduce((sum, t) => sum + t.totalNilai, 0)

  const totalPengeluaran = transaksi.filter((t) => t.jenis === "PENGELUARAN").reduce((sum, t) => sum + t.totalNilai, 0)

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-green-600">Rp {totalPemasukan.toLocaleString()}</div>
            <p className="text-sm text-gray-600">Total Pemasukan</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-red-600">Rp {totalPengeluaran.toLocaleString()}</div>
            <p className="text-sm text-gray-600">Total Pengeluaran</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-blue-600">
              Rp {(totalPemasukan - totalPengeluaran).toLocaleString()}
            </div>
            <p className="text-sm text-gray-600">Selisih</p>
          </CardContent>
        </Card>
      </div>

      {/* Transaction Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Semua Transaksi ({transaksi.length})
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
                      {new Date(t.createdAt).toLocaleDateString("id-ID", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="py-3 px-4">{getTransactionBadge(t.jenis)}</td>
                    <td className="py-3 px-4">{t.nasabah?.nama || "Bank Sampah"}</td>
                    <td className="py-3 px-4 text-sm">{t.keterangan}</td>
                    <td className="py-3 px-4 text-sm">
                      {t.detailTransaksi && t.detailTransaksi.length > 0 && (
                        <div className="space-y-1">
                          {t.detailTransaksi.map((detail, idx) => (
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
                          t.jenis === "PEMASUKAN" || t.jenis === "PENJUALAN_SAMPAH" ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {t.jenis === "PENGELUARAN" ? "-" : "+"}Rp {t.totalNilai.toLocaleString()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
