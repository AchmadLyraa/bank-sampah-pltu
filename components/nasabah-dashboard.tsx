import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Wallet,
  History,
  User,
  Lock,
  Package,
  BanknoteIcon as Bank,
} from "lucide-react"; // 🆕 Import Package and Bank
import EditProfileForm from "@/components/edit-profile-form";
import ChangePasswordForm from "@/components/change-password-form";
import { BankSampahSelector } from "@/components/bank-sampah-selector"; // 🆕 Import BankSampahSelector
import type {
  Nasabah,
  Transaksi,
  InventarisSampah,
  NasabahRelationshipForSession,
} from "@/types"; // 🆕 Import InventarisSampah and NasabahRelationshipForSession

interface NasabahDashboardProps {
  nasabah: Nasabah; // This is the specific Nasabah relationship, which includes Person and BankSampah
  transaksi: Transaksi[];
  inventarisList: InventarisSampah[]; // 🆕 New prop for inventaris
  bankSampahRelationships: NasabahRelationshipForSession[]; // 🆕 New prop for all relationships
  selectedBankSampahId: string; // 🆕 New prop for selected bank ID
}

export default function NasabahDashboard({
  nasabah,
  transaksi,
  inventarisList,
  bankSampahRelationships,
  selectedBankSampahId,
}: NasabahDashboardProps) {
  if (!nasabah || !nasabah.person || !nasabah.bankSampah) {
    // Ensure person and bankSampah data are available
    return <div>Data nasabah atau bank sampah tidak ditemukan</div>;
  }

  const getTransactionBadge = (jenis: string) => {
    switch (jenis) {
      case "PEMASUKAN":
        return (
          <Badge variant="default" className="bg-green-100 text-green-800">
            Pemasukan
          </Badge>
        );
      case "PENGELUARAN":
        return <Badge variant="destructive">Penarikan</Badge>;
      default:
        return <Badge variant="outline">{jenis}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Selamat Datang, {nasabah.person.nama}
          </h1>
          <p className="text-gray-600">
            Kelola profil dan lihat riwayat transaksi Anda
          </p>
        </div>
        {/* 🆕 Bank Sampah Selector */}
        <BankSampahSelector
          relationships={bankSampahRelationships}
          selectedBankSampahId={selectedBankSampahId}
        />
      </div>

      {/* 🆕 Currently Selected Bank Sampah Info */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4 flex items-center gap-3">
          <Bank className="h-6 w-6 text-blue-600" />
          <div>
            <h3 className="font-semibold text-blue-900">
              {nasabah.bankSampah.nama}
            </h3>
            <p className="text-sm text-blue-700">
              Alamat: {nasabah.bankSampah.alamat}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Saldo Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Saldo Anda</CardTitle>
          <Wallet className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-green-600">
            Rp {nasabah.saldo.toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground">
            Saldo dapat ditarik kapan saja
          </p>
        </CardContent>
      </Card>

      {/* Tabs for different sections */}
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full h-auto grid-cols-2 md:grid-cols-4">
          {" "}
          {/* 🆕 Added Inventaris tab */}
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Profil
          </TabsTrigger>
          <TabsTrigger value="password" className="flex items-center gap-2">
            <Lock className="h-4 w-4" />
            Password
          </TabsTrigger>
          <TabsTrigger value="transactions" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            Transaksi
          </TabsTrigger>
          <TabsTrigger value="inventaris" className="flex items-center gap-2">
            {" "}
            {/* 🆕 New Tab */}
            <Package className="h-4 w-4" />
            Inventaris
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-4">
          <EditProfileForm nasabah={nasabah} />
        </TabsContent>

        {/* Password Tab */}
        <TabsContent value="password" className="space-y-4">
          <ChangePasswordForm nasabah={nasabah} />
        </TabsContent>

        {/* Transaction History Tab */}
        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Riwayat Transaksi
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {transaksi.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    Belum ada transaksi
                  </p>
                ) : (
                  transaksi.map((t) => (
                    <div
                      key={t.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {getTransactionBadge(t.jenis)}
                          <span className="font-medium">{t.keterangan}</span>
                        </div>
                        {t.detailTransaksi && t.detailTransaksi.length > 0 && (
                          <div className="text-sm text-gray-600">
                            {t.detailTransaksi.map((detail, idx) => (
                              <span key={detail.id}>
                                {detail.inventarisSampah?.jenisSampah} (
                                {detail.jumlahUnit}
                                {detail.inventarisSampah?.satuan || "KG"})
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
                        <p
                          className={`font-bold ${t.jenis === "PEMASUKAN" ? "text-green-600" : "text-red-600"}`}
                        >
                          {t.jenis === "PENGELUARAN" ? "-" : "+"}Rp{" "}
                          {t.totalNilai.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 🆕 Inventaris Tab */}
        <TabsContent value="inventaris" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Daftar Harga Sampah
              </CardTitle>
            </CardHeader>
            <CardContent>
              {inventarisList.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  Tidak ada jenis sampah yang terdaftar di bank sampah ini.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4">Jenis Sampah</th>
                        <th className="text-left py-3 px-4">Harga Beli/kg</th>
                        <th className="text-left py-3 px-4">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {inventarisList.map((item) => (
                        <tr key={item.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4 font-medium">
                            {item.jenisSampah}
                          </td>
                          <td className="py-3 px-4">
                            Rp {item.hargaPerUnit.toLocaleString()} /{" "}
                            {item.satuan || "KG"}
                          </td>
                          <td className="py-3 px-4">
                            <Badge
                              variant={item.isActive ? "default" : "secondary"}
                              className={
                                item.isActive
                                  ? "bg-green-100 text-green-800"
                                  : ""
                              }
                            >
                              {item.isActive ? "Aktif" : "Non-aktif"}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
