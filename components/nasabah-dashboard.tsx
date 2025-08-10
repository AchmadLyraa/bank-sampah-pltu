import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Wallet, History, User, Lock } from "lucide-react";
import EditProfileForm from "@/components/edit-profile-form";
import ChangePasswordForm from "@/components/change-password-form";
import type { Nasabah, Transaksi } from "@/types";

interface NasabahDashboardProps {
  data: {
    nasabah: Nasabah | null;
    transaksi: Transaksi[];
  };
}

export default function NasabahDashboard({ data }: NasabahDashboardProps) {
  const { nasabah, transaksi } = data;

  if (!nasabah || !nasabah.person) {
    // Ensure person data is available
    return <div>Data nasabah tidak ditemukan</div>;
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
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Selamat Datang, {nasabah.person?.nama}
        </h1>
        <p className="text-gray-600">
          Kelola profil dan lihat riwayat transaksi Anda
        </p>
      </div>

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
        <TabsList className="grid w-full grid-cols-3">
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
                                {detail.beratKg}kg)
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
      </Tabs>
    </div>
  );
}
