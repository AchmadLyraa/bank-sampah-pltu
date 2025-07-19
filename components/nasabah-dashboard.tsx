import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Wallet, History } from "lucide-react"
import type { Nasabah, Transaksi } from "@/types"

interface NasabahDashboardProps {
  data: {
    nasabah: Nasabah | null
    transaksi: Transaksi[]
  }
}

export default function NasabahDashboard({ data }: NasabahDashboardProps) {
  const { nasabah, transaksi } = data

  if (!nasabah) {
    return <div>Data nasabah tidak ditemukan</div>
  }

  const getTransactionBadge = (jenis: string) => {
    switch (jenis) {
      case "PEMASUKAN":
        return (
          <Badge variant="default" className="bg-green-100 text-green-800">
            Pemasukan
          </Badge>
        )
      case "PENGELUARAN":
        return <Badge variant="destructive">Penarikan</Badge>
      default:
        return <Badge variant="outline">{jenis}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Selamat Datang, {nasabah.nama}</h1>
        <p className="text-gray-600">Kelola saldo dan lihat riwayat transaksi Anda</p>
      </div>

      {/* Saldo Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Saldo Anda</CardTitle>
          <Wallet className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-green-600">Rp {nasabah.saldo.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">Saldo dapat ditarik kapan saja</p>
        </CardContent>
      </Card>

      {/* Profile Info */}
      <Card>
        <CardHeader>
          <CardTitle>Informasi Profil</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Nama</p>
              <p className="text-base">{nasabah.nama}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Email</p>
              <p className="text-base">{nasabah.email}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Telepon</p>
              <p className="text-base">{nasabah.telepon}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Alamat</p>
              <p className="text-base">{nasabah.alamat}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transaction History */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Riwayat Transaksi
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {transaksi.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Belum ada transaksi</p>
            ) : (
              transaksi.map((t) => (
                <div key={t.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {getTransactionBadge(t.jenis)}
                      <span className="font-medium">{t.keterangan}</span>
                    </div>
                    {t.detailTransaksi && t.detailTransaksi.length > 0 && (
                      <div className="text-sm text-gray-600">
                        {t.detailTransaksi.map((detail, idx) => (
                          <span key={detail.id}>
                            {detail.inventarisSampah?.jenisSampah} ({detail.beratKg}kg)
                            {idx < t.detailTransaksi!.length - 1 && ", "}
                          </span>
                        ))}
                      </div>
                    )}
                    <p className="text-xs text-gray-400">
                      {new Date(t.createdAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${t.jenis === "PEMASUKAN" ? "text-green-600" : "text-red-600"}`}>
                      {t.jenis === "PENGELUARAN" ? "-" : "+"}Rp {t.totalNilai.toLocaleString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
