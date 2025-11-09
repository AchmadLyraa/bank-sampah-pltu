"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { updateBankSampahProfileAction } from "@/app/actions/bank-sampah";
import { logoutAction } from "@/app/actions/auth";
import { User, Loader2, MapPin, Phone, LogOut, Navigation } from "lucide-react";
import LogoutButton from "./LogoutButton";

interface EditBankSampahProfileFormProps {
  bankSampah: {
    id: string;
    nama: string;
    email: string;
    telepon: string;
    alamat: string;
    latitude: number | null;
    longitude: number | null;
  };
}

export default function EditBankSampahProfileForm({
  bankSampah,
}: EditBankSampahProfileFormProps) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setMessage(null);

    formData.append("bankSampahId", bankSampah.id);

    try {
      const result = await updateBankSampahProfileAction(formData);

      if (result.error) {
        setMessage({ type: "error", text: result.error });
      } else {
        setMessage({
          type: "success",
          text: result.message || "Profil berhasil diperbarui!",
        });
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: "Terjadi kesalahan saat memperbarui profil",
      });
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(null), 3000);
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Edit Profil
        </CardTitle>
        {/*<form action={logoutAction}>
          <Button
            type="submit"
            variant="ghost"
            className="text-white hover:text-red-800 hover:bg-red-50 bg-red-500 border hover:border-red-800"
          >
            <LogOut className="h-5 w-5 mr-2" />
            Logout
          </Button>
        </form>*/}
        <LogoutButton />
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="space-y-4">
          {/* Nama - READ ONLY */}
          <div className="space-y-2">
            <Label htmlFor="nama">Nama Bank Sampah</Label>
            <Input
              id="nama"
              value={bankSampah.nama}
              disabled
              className="bg-gray-100 cursor-not-allowed"
            />
            <p className="text-xs text-gray-500">Nama tidak dapat diubah</p>
          </div>

          {/* Email - READ ONLY */}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              value={bankSampah.email}
              disabled
              className="bg-gray-100 cursor-not-allowed"
            />
            <p className="text-xs text-gray-500">Email tidak dapat diubah</p>
          </div>

          {/* Telepon - EDITABLE */}
          <div className="space-y-2">
            <Label htmlFor="telepon" className="flex items-center gap-1">
              <Phone className="h-4 w-4" />
              Nomor Telepon
            </Label>
            <Input
              id="telepon"
              name="telepon"
              defaultValue={bankSampah.telepon}
              placeholder="08xxxxxxxxxx"
              required
            />
          </div>

          {/* Alamat - EDITABLE */}
          <div className="space-y-2">
            <Label htmlFor="alamat" className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              Alamat
            </Label>
            <Textarea
              id="alamat"
              name="alamat"
              defaultValue={bankSampah.alamat}
              placeholder="Alamat lengkap bank sampah"
              rows={3}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="latitude" className="flex items-center gap-1">
              <Navigation className="h-4 w-4" />
              Latitude
            </Label>
            <Input
              id="latitude"
              name="latitude"
              type="number"
              step="any"
              defaultValue={bankSampah.latitude || ""}
              placeholder="Contoh: -6.200000"
            />
            <p className="text-xs text-gray-500">
              Koordinat lintang lokasi bank sampah
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="longitude" className="flex items-center gap-1">
              <Navigation className="h-4 w-4" />
              Longitude
            </Label>
            <Input
              id="longitude"
              name="longitude"
              type="number"
              step="any"
              defaultValue={bankSampah.longitude || ""}
              placeholder="Contoh: 106.816666"
            />
            <p className="text-xs text-gray-500">
              Koordinat bujur lokasi bank sampah
            </p>
          </div>

          {message && (
            <div
              className={`p-3 rounded-lg text-sm ${
                message.type === "success"
                  ? "bg-green-50 text-green-800 border border-green-200"
                  : "bg-red-50 text-red-800 border border-red-200"
              }`}
            >
              {message.text}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Simpan Perubahan
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
