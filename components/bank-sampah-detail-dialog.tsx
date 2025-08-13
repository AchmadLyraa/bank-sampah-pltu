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
import { Input } from "@/components/ui/input";
import {
  Users,
  Wallet,
  Package,
  MapPin,
  Building2,
  Search,
  ArrowUpDown,
  ShoppingCart,
  DollarSign,
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
  const [nasabahSearch, setNasabahSearch] = useState("");

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

  const filteredNasabah =
    data?.nasabahDetails?.filter(
      (nasabah: any) =>
        nasabah.nama.toLowerCase().includes(nasabahSearch.toLowerCase()) ||
        nasabah.email.toLowerCase().includes(nasabahSearch.toLowerCase()),
    ) || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
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

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
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
                    {data.statistics.totalStokTerkumpul} kg
                  </p>
                  <p className="text-sm text-gray-600">Stok Terkumpul</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 text-center">
                  <ArrowUpDown className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                  <p className="text-lg font-bold">
                    {formatCurrency(data.statistics.totalPemasukan)}
                  </p>
                  <p className="text-sm text-gray-600">Total Pembelian</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 text-center">
                  <ShoppingCart className="h-8 w-8 mx-auto mb-2 text-indigo-600" />
                  <p className="text-lg font-bold">
                    {formatCurrency(data.statistics.totalPenjualan)}
                  </p>
                  <p className="text-sm text-gray-600">Total Penjualan</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 text-center">
                  <DollarSign
                    className={`h-8 w-8 mx-auto mb-2 ${data.statistics.keuntungan >= 0 ? "text-green-600" : "text-red-600"}`}
                  />
                  <p
                    className={`text-lg font-bold ${data.statistics.keuntungan >= 0 ? "text-green-600" : "text-red-600"}`}
                  >
                    {formatCurrency(data.statistics.keuntungan)}
                  </p>
                  <p className="text-sm text-gray-600">Keuntungan</p>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="nasabah" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="nasabah">Detail Nasabah</TabsTrigger>
                <TabsTrigger value="inventaris">Inventaris Sampah</TabsTrigger>
                {/*<TabsTrigger value="transaksi">Transaksi</TabsTrigger>*/}
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

                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Cari nasabah berdasarkan nama atau email..."
                    value={nasabahSearch}
                    onChange={(e) => setNasabahSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {filteredNasabah.map((nasabah: any) => (
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
                  {filteredNasabah.length === 0 && (
                    <div className="text-center py-4 text-gray-500">
                      {nasabahSearch
                        ? "Tidak ada nasabah yang sesuai pencarian"
                        : "Belum ada nasabah terdaftar"}
                    </div>
                  )}
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

              {/*<TabsContent value="transaksi" className="space-y-4">
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {data.transaksi.map((transaksi: any) => (
                    <Card key={transaksi.id}>
                      <CardContent className="p-3">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium">
                              {transaksi.nasabahNama}
                            </p>
                            <p className="text-sm text-gray-600">
                              {transaksi.keterangan}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(transaksi.createdAt).toLocaleDateString(
                                "id-ID",
                                {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                },
                              )}
                            </p>
                          </div>
                          <div className="text-right">
                            <p
                              className={`font-medium ${
                                transaksi.jenis === "PEMASUKAN"
                                  ? "text-blue-600"
                                  : transaksi.jenis === "PENJUALAN_SAMPAH"
                                    ? "text-green-600"
                                    : "text-red-600"
                              }`}
                            >
                              {formatCurrency(transaksi.totalNilai)}
                            </p>
                            <Badge
                              variant="outline"
                              className={`text-xs ${
                                transaksi.jenis === "PEMASUKAN"
                                  ? "border-blue-200 text-blue-700"
                                  : transaksi.jenis === "PENJUALAN_SAMPAH"
                                    ? "border-green-200 text-green-700"
                                    : "border-red-200 text-red-700"
                              }`}
                            >
                              {transaksi.jenis.replace("_", " ")}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {data.transaksi.length === 0 && (
                    <div className="text-center py-4 text-gray-500">
                      Belum ada transaksi
                    </div>
                  )}
                </div>
              </TabsContent>*/}
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
