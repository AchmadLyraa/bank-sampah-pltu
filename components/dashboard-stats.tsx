"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { Users, Wallet, Package, TrendingUp } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface DashboardStatsProps {
  data: {
    nasabahCount: number;
    saldoNasabah: number;
    saldoBankSampah: number;
    inventaris: any[];
    recentTransaksi: any[];
  };
}

export default function DashboardStats({ data }: DashboardStatsProps) {
  const [open, setOpen] = useState(false);
  const totalStok = data.inventaris.reduce(
    (sum, item) => sum + item.stokUnit,
    0,
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {/* Total Nasabah */}
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

      {/* Total Saldo */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Saldo</CardTitle>
          <Wallet className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            Rp {(data.saldoNasabah + data.saldoBankSampah).toLocaleString()}
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <button className="text-xs text-blue-600 underline">
                Lihat detail
              </button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Detail Saldo</DialogTitle>
              </DialogHeader>
              <div className="space-y-2">
                <p>
                  💰 Saldo Nasabah:{" "}
                  <b>Rp {data.saldoNasabah.toLocaleString()}</b>
                </p>
                <p>
                  🏦 Saldo Bank Sampah:{" "}
                  <b>Rp {data.saldoBankSampah.toLocaleString()}</b>
                </p>
                <hr />
                <p>
                  Total:{" "}
                  <b>
                    Rp{" "}
                    {(
                      data.saldoNasabah + data.saldoBankSampah
                    ).toLocaleString()}
                  </b>
                </p>
              </div>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      {/* Total Stok */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Stok</CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {totalStok.toFixed(1)}
            {" kg/pcs"}
          </div>{" "}
          <p className="text-xs text-muted-foreground">Stok sampah tersedia</p>
        </CardContent>
      </Card>

      {/* Jenis Sampah */}
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
  );
}
