import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Wallet, Package, TrendingUp } from "lucide-react"

interface DashboardStatsProps {
  data: {
    nasabahCount: number
    totalSaldo: number
    inventaris: any[]
    recentTransaksi: any[]
  }
}

export default function DashboardStats({ data }: DashboardStatsProps) {
  const totalStok = data.inventaris.reduce((sum, item) => sum + item.stokKg, 0)

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Nasabah</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.nasabahCount}</div>
          <p className="text-xs text-muted-foreground">Nasabah terdaftar</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Saldo</CardTitle>
          <Wallet className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">Rp {data.totalSaldo.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">Saldo semua nasabah</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Stok</CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalStok.toFixed(1)} kg</div>
          <p className="text-xs text-muted-foreground">Stok sampah tersedia</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Jenis Sampah</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.inventaris.length}</div>
          <p className="text-xs text-muted-foreground">Jenis sampah dikelola</p>
        </CardContent>
      </Card>
    </div>
  )
}
