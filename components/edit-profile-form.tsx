"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { updateNasabahProfileAction } from "@/app/actions/nasabah-profile";
import { User, Loader2, MapPin, Phone, CreditCard } from "lucide-react";
import type { Nasabah } from "@/types";

interface EditProfileFormProps {
  nasabah: Nasabah;
}

export default function EditProfileForm({ nasabah }: EditProfileFormProps) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setMessage(null);

    // Add nasabahId to formData
    formData.append("personId", nasabah.personId);

    try {
      const result = await updateNasabahProfileAction(formData);

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
      // Clear message after 3 seconds
      setTimeout(() => setMessage(null), 3000);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Edit Profil
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="space-y-4">
          {/* Nama - READ ONLY */}
          <div className="space-y-2">
            <Label htmlFor="nama">Nama Lengkap</Label>
            <Input
              id="nama"
              value={nasabah.person?.nama}
              disabled
              className="bg-gray-100 cursor-not-allowed"
            />
            <p className="text-xs text-gray-500">Nama tidak dapat diubah</p>
          </div>

          {/* NIK */}
          {/* Telepon - EDITABLE */}
          <div className="space-y-2">
            <Label htmlFor="nik" className="flex items-center gap-1">
              <CreditCard className="h-4 w-4" />
              NIK
            </Label>
            <Input
              id="nik"
              name="nik"
              defaultValue={nasabah.person?.nik}
              placeholder="62xxxxxxxxxx"
              required
            />
          </div>

          {/* Email - READ ONLY */}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              value={nasabah.person?.email}
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
              defaultValue={nasabah.person?.telepon}
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
              defaultValue={nasabah.person?.alamat}
              placeholder="Alamat lengkap Anda"
              rows={3}
              required
            />
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
