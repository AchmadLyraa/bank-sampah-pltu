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
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
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
  UserPlus,
  Edit,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import {
  getBankSampahDetail,
  toggleNasabahStatus,
  updateBankSampahCoordinate,
} from "@/app/actions/controller";
import { AddNasabahDialog } from "@/components/add-nasabah-dialog";
import { EditInventarisDialog } from "@/components/edit-inventaris-dialog";
import { AddInventarisDialog } from "@/components/add-inventaris-dialog";
import BackupDownloadButtonController from "@/components/backup-download-button-controller";

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
  const [addNasabahOpen, setAddNasabahOpen] = useState(false);
  const [editInventarisOpen, setEditInventarisOpen] = useState(false);
  const [addInventarisOpen, setAddInventarisOpen] = useState(false);
  const [selectedInventaris, setSelectedInventaris] = useState<any>(null);
  const [editCoordinateOpen, setEditCoordinateOpen] = useState(false);
  const [coordinateLoading, setCoordinateLoading] = useState(false);

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

  const handleToggleNasabah = async (nasabahId: string) => {
    try {
      const result = await toggleNasabahStatus(nasabahId);
      if (result.success) {
        // Refresh data
        fetchDetail();
      }
    } catch (error) {
      console.error("Error toggling nasabah status:", error);
    }
  };

  const handleEditInventaris = (inventaris: any) => {
    setSelectedInventaris(inventaris);
    setEditInventarisOpen(true);
  };

  const handleUpdateCoordinate = async (formData: FormData) => {
    const latitude = Number.parseFloat(formData.get("latitude") as string);
    const longitude = Number.parseFloat(formData.get("longitude") as string);

    // Validate Indonesia coordinates
    if (latitude < -11 || latitude > 6) {
      alert("Latitude harus berada dalam batas Indonesia (-11° hingga 6°)");
      return;
    }
    if (longitude < 95 || longitude > 141) {
      alert("Longitude harus berada dalam batas Indonesia (95° hingga 141°)");
      return;
    }

    setCoordinateLoading(true);
    try {
      const result = await updateBankSampahCoordinate(
        bankSampahId,
        latitude,
        longitude,
      );
      if (result.success) {
        setEditCoordinateOpen(false);
        fetchDetail(); // Refresh data
      } else {
        alert(result.error || "Gagal mengupdate koordinat");
      }
    } catch (error) {
      alert("Terjadi kesalahan sistem");
    } finally {
      setCoordinateLoading(false);
    }
  };

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
    <>
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
                      variant={
                        data.bankSampah.isActive ? "default" : "secondary"
                      }
                    >
                      {data.bankSampah.isActive ? "Aktif" : "Nonaktif"}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p>
                    <strong>Email:</strong> {data.bankSampah.email}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>
                        {data.bankSampah.latitude && data.bankSampah.longitude
                          ? `${data.bankSampah.latitude}, ${data.bankSampah.longitude}`
                          : "Lokasi belum diset"}
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditCoordinateOpen(true)}
                      className="flex items-center gap-1"
                    >
                      <Edit className="h-3 w-3" />
                      Edit Lokasi
                    </Button>
                  </div>
                  <div className="flex items-center justify-center">
                    <BackupDownloadButtonController
                      bankSampahId={data.bankSampah.id}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Statistics Cards */}
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
                    <p className="text-sm text-gray-600">Total Saldo Nasabah</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4 text-center">
                    <Package className="h-8 w-8 mx-auto mb-2 text-orange-600" />
                    <p className="text-2xl font-bold">
                      {data.statistics.totalStokTerkumpul} unit
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
                  <TabsTrigger value="inventaris">
                    Inventaris Sampah
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="nasabah" className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex gap-4">
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
                    <Button
                      onClick={() => setAddNasabahOpen(true)}
                      className="flex items-center gap-2"
                    >
                      <UserPlus className="h-4 w-4" />
                      Tambah Nasabah
                    </Button>
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
                            <div className="flex items-center gap-3">
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
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleToggleNasabah(nasabah.id)}
                                className="p-1"
                              >
                                {nasabah.isActive ? (
                                  <ToggleRight className="h-5 w-5 text-green-600" />
                                ) : (
                                  <ToggleLeft className="h-5 w-5 text-gray-400" />
                                )}
                              </Button>
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
                  <div className="flex justify-end">
                    <Button
                      onClick={() => setAddInventarisOpen(true)}
                      className="flex items-center gap-2"
                    >
                      <Package className="h-4 w-4" />
                      Tambah Jenis Sampah
                    </Button>
                  </div>

                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {data.inventaris.map((item: any) => (
                      <Card key={item.id}>
                        <CardContent className="p-3">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-medium">{item.jenisSampah}</p>
                              <Badge
                                variant={
                                  item.isActive ? "default" : "secondary"
                                }
                                className="text-xs"
                              >
                                {item.isActive ? "Aktif" : "Nonaktif"}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="text-right">
                                <p className="font-medium">
                                  {formatCurrency(item.hargaPerUnit)} /{" "}
                                  {item.satuan || "UNIT"}
                                </p>
                                <p className="text-sm text-gray-600">
                                  Stok: {item.stokUnit ?? 0}{" "}
                                  {item.satuan?.toLowerCase() || "unit"}
                                </p>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditInventaris(item)}
                                className="p-1"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
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

      <AddNasabahDialog
        open={addNasabahOpen}
        onOpenChange={setAddNasabahOpen}
        bankSampahId={bankSampahId}
        bankSampahName={bankSampahName}
        onSuccess={fetchDetail}
      />

      <EditInventarisDialog
        open={editInventarisOpen}
        onOpenChange={setEditInventarisOpen}
        inventaris={selectedInventaris}
        onSuccess={fetchDetail}
      />

      <AddInventarisDialog
        open={addInventarisOpen}
        onOpenChange={setAddInventarisOpen}
        bankSampahId={bankSampahId}
        bankSampahName={bankSampahName}
        onSuccess={fetchDetail}
      />
      {/* Coordinate Edit Dialog */}
      <Dialog open={editCoordinateOpen} onOpenChange={setEditCoordinateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Koordinat Lokasi</DialogTitle>
          </DialogHeader>
          <form action={handleUpdateCoordinate} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="latitude">Latitude</Label>
                <Input
                  id="latitude"
                  name="latitude"
                  type="number"
                  step="any"
                  placeholder="-6.2088"
                  defaultValue={data?.bankSampah.latitude || ""}
                  required
                />
                <p className="text-xs text-gray-500">
                  Batas Indonesia: -11° hingga 6°
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="longitude">Longitude</Label>
                <Input
                  id="longitude"
                  name="longitude"
                  type="number"
                  step="any"
                  placeholder="106.8456"
                  defaultValue={data?.bankSampah.longitude || ""}
                  required
                />
                <p className="text-xs text-gray-500">
                  Batas Indonesia: 95° hingga 141°
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditCoordinateOpen(false)}
                disabled={coordinateLoading}
              >
                Batal
              </Button>
              <Button type="submit" disabled={coordinateLoading}>
                {coordinateLoading ? "Menyimpan..." : "Simpan"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
