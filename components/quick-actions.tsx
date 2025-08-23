import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, History, BarChart3, ArrowUpDown } from "lucide-react";

export default function QuickActions() {
  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Kelola</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link href="/bank-sampah/inventaris">
            <Button
              variant="outline"
              className="w-full h-20 flex flex-col gap-2 bg-transparent"
            >
              <Package className="h-6 w-6" />
              <span className="text-sm">Inventaris</span>
            </Button>
          </Link>

          <Link href="/bank-sampah/transaksi">
            <Button
              variant="outline"
              className="w-full h-20 flex flex-col gap-2 bg-transparent"
            >
              <History className="h-6 w-6" />
              <span className="text-sm">Transaksi</span>
            </Button>
          </Link>

          <Link href="/bank-sampah/laporan">
            <Button
              variant="outline"
              className="w-full h-20 flex flex-col gap-2 bg-transparent"
            >
              <BarChart3 className="h-6 w-6" />
              <span className="text-sm">Laporan</span>
            </Button>
          </Link>

          <Link href="/bank-sampah/transaksi-umum">
            <Button
              variant="outline"
              className="w-full h-20 flex flex-col gap-2 bg-transparent"
            >
              <ArrowUpDown className="h-6 w-6" />
              <span className="text-sm">Transaksi Umum</span>
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
