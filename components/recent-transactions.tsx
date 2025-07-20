import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Transaksi } from "@/types"

interface RecentTransactionsProps {
  transactions: Transaksi[]
}

export default function RecentTransactions({ transactions }: RecentTransactionsProps) {
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transaksi Terbaru</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {transactions.length === 0 ? (
            <p className="text-gray-500 text-center py-4">Belum ada transaksi</p>
          ) : (
            transactions.map((transaksi) => (
              <div key={transaksi.id} className="flex items-center justify-between p-4 border rounded-lg flex-wrap md:flex-row flex-column">
                <div className="flex-1">
                  <div className="flex-1">
                    {getTransactionBadge(transaksi.jenis)}
                    <span className="font-medium ml-2">{transaksi.nasabah?.nama || "Bank Sampah"}</span>
                  </div>
                  <p className="text-sm text-gray-600">{transaksi.keterangan}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(transaksi.createdAt).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <div className="sm:flex-1 sm:text-right flex-[100%]">
                  <p
                    className={`font-bold ${
                      transaksi.jenis === "PEMASUKAN" || transaksi.jenis === "PENJUALAN_SAMPAH"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {transaksi.jenis === "PENGELUARAN" ? "-" : "+"}Rp {transaksi.totalNilai.toLocaleString()}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
