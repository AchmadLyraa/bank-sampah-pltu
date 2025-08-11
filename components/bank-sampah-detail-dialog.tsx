"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users,
  Wallet,
  Package,
  TrendingUp,
  MapPin,
  Building2,
} from "lucide-react";
import { getBankSampahDetail } from "@/app/actions/controller";

interface BankSampahDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bankSampahId: string;
  bankSampahName: string;
}

export function BankSampahDetailDialog({
  open,
  onOpenChange,
  bankSampahId,
  bankSampahName,
}: BankSampahDetailDialogProps) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);

  const fetchDetail = async () => {
    if (!open || !bankSampahId) return;

    setLoading(true);
    try {
      const result = await getBankSampahDetail(bankSampahId);
      if (result.success) {
        setData(result.data);
      }
    } catch (error) {
      console.error("Error fetching detail:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [open, bankSampahId]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(amount);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Detail {bankSampahName}
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : data ? (
          <div className="space-y-6">
            {/* Bank Sampah Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Informasi Bank Sampah</span>
                  <Badge
                    variant={data.bankSampah.isActive ? "default" : "secondary"}
                  >
                    {data.bankSampah.isActive ? "Aktif" : "Nonaktif"}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p>
                  <strong>Email:</strong> {data.bankSampah.email}
                </p>
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>
                    {data.bankSampah.latitude && data.bankSampah.longitude
                      ? `${data.bankSampah.latitude}, ${data.bankSampah.longitude}`
                      : "Lokasi belum diset"}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Statistics Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <Users className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                  <p className="text-2xl font-bold">
                    {data.statistics.totalNasabah}
                  </p>
                  <p className="text-sm text-gray-600">Total Nasabah</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 text-center">
                  <Wallet className="h-8 w-8 mx-auto mb-2 text-green-600" />
                  <p className="text-lg font-bold">
                    {formatCurrency(data.statistics.totalSaldo)}
                  </p>
                  <p className="text-sm text-gray-600">Total Saldo</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 text-center">
                  <Package className="h-8 w-8 mx-auto mb-2 text-orange-600" />
                  <p className="text-2xl font-bold">
                    {data.statistics.totalInventaris}
                  </p>
                  <p className="text-sm text-gray-600">Jenis Sampah</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 text-center">
                  <TrendingUp className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                  <p className="text-2xl font-bold">
                    {data.statistics.totalTransaksi}
                  </p>
                  <p className="text-sm text-gray-600">Total Transaksi</p>
                </CardContent>
              </Card>
            </div>

            {/* Detailed Tabs */}
            <Tabs defaultValue="nasabah" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="nasabah">Detail Nasabah</TabsTrigger>
                <TabsTrigger value="inventaris">Inventaris Sampah</TabsTrigger>
              </TabsList>

              <TabsContent value="nasabah" className="space-y-4">
                <div className="flex gap-4 mb-4">
                  <Badge
                    variant="default"
                    className="bg-green-100 text-green-800"
                  >
                    Aktif: {data.statistics.nasabahAktif}
                  </Badge>
                  <Badge
                    variant="secondary"
                    className="bg-red-100 text-red-800"
                  >
                    Nonaktif: {data.statistics.nasabahNonaktif}
                  </Badge>
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {data.nasabahDetails.map((nasabah: any) => (
                    <Card key={nasabah.id}>
                      <CardContent className="p-3">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium">{nasabah.nama}</p>
                            <p className="text-sm text-gray-600">
                              {nasabah.email}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">
                              {formatCurrency(nasabah.saldo)}
                            </p>
                            <Badge
                              variant={
                                nasabah.isActive ? "default" : "secondary"
                              }
                              className="text-xs"
                            >
                              {nasabah.isActive ? "Aktif" : "Nonaktif"}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="inventaris" className="space-y-4">
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {data.inventaris.map((item: any) => (
                    <Card key={item.id}>
                      <CardContent className="p-3">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium">{item.jenisSampah}</p>
                            <Badge
                              variant={item.isActive ? "default" : "secondary"}
                              className="text-xs"
                            >
                              {item.isActive ? "Aktif" : "Nonaktif"}
                            </Badge>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">
                              {formatCurrency(item.hargaPerKg)}/kg
                            </p>
                            <p className="text-sm text-gray-600">
                              Stok: {item.stokKg} kg
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            Gagal memuat detail bank sampah
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
