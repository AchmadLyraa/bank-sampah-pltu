"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Transaksi } from "@/types";
import { DateTime } from "luxon";
import { useEffect, useState } from "react";

interface RecentTransactionItem
  extends Omit<Transaksi, "nasabah" | "detailTransaksi"> {
  nasabah?: { person: { nama: string } } | null;
  detailTransaksi?: {
    id: string;
    createdAt: Date;
    hargaPerKg: number;
    transaksiId: string;
    inventarisSampahId: string;
    beratKg: number;
    subtotal: number;
    inventarisSampah: { jenisSampah: string } | null;
  }[];
}

interface RecentTransactionsProps {
  transactions: Transaksi[];
}

export default function RecentTransactions({
  transactions,
}: RecentTransactionsProps) {
  const [isClient, setIsClient] = useState(false);
  const [userTimezone, setUserTimezone] = useState<string>("UTC");

  // 🔧 FORCE CLIENT-SIDE ONLY RENDERING
  useEffect(() => {
    setIsClient(true);
    setUserTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone);
    console.log(
      "🌍 User timezone:",
      Intl.DateTimeFormat().resolvedOptions().timeZone,
    );
  }, []);

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

  const formatDateTime = (dateString: string) => {
    // 🚨 FORCE CLIENT-SIDE ONLY
    if (!isClient) {
      return "Loading...";
    }

    try {
      console.log("📅 Raw date:", dateString);
      console.log("🌍 Using timezone:", userTimezone);

      // Method 1: Pure JavaScript approach (most reliable)
      const date = new Date(dateString);
      console.log("📅 Parsed date (UTC):", date.toISOString());

      const formatted = date.toLocaleString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        timeZone: userTimezone, // Use detected timezone
        hour12: false,
      });

      console.log("📅 Formatted result:", formatted);
      return formatted;
    } catch (error) {
      console.error("❌ Date formatting error:", error);

      // Ultimate fallback - pure JS
      const fallbackDate = new Date(dateString);
      return fallbackDate.toLocaleString("id-ID");
    }
  };

  // 🔧 Show loading state during hydration
  if (!isClient) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Transaksi Terbaru</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-gray-500 text-center py-4">
              Loading timezone...
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transaksi Terbaru</CardTitle>
        {/* 🔍 DEBUG INFO - Remove this in production */}
        <p className="text-xs text-gray-400">Timezone: {userTimezone}</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {transactions.length === 0 ? (
            <p className="text-gray-500 text-center py-4">
              Belum ada transaksi
            </p>
          ) : (
            transactions.map((transaksi) => (
              <div
                key={transaksi.id}
                className="flex items-center justify-between p-4 border rounded-lg flex-wrap md:flex-row flex-column"
              >
                <div className="flex-1">
                  <div className="flex-1">
                    {getTransactionBadge(transaksi.jenis)}
                    <span className="font-medium ml-2">
                      {transaksi.nasabah?.person?.nama || "Bank Sampah"}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {transaksi.keterangan}
                  </p>
                  <p className="text-xs text-gray-400">
                    {formatDateTime(transaksi.createdAt)}
                  </p>
                </div>
                <div className="sm:flex-1 sm:text-right flex-[100%]">
                  <p
                    className={`font-bold ${
                      transaksi.jenis === "PEMASUKAN" ||
                      transaksi.jenis === "PENJUALAN_SAMPAH"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {transaksi.jenis === "PENGELUARAN" ? "-" : "+"}Rp{" "}
                    {transaksi.totalNilai.toLocaleString()}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
