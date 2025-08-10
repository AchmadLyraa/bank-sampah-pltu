"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { changeNasabahPasswordAction } from "@/app/actions/nasabah-profile";
import { Lock, Loader2, Eye, EyeOff } from "lucide-react";
import type { Nasabah } from "@/types";

interface ChangePasswordFormProps {
  nasabah: Nasabah;
}

export default function ChangePasswordForm({
  nasabah,
}: ChangePasswordFormProps) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setMessage(null);

    // Add nasabahId to formData
    formData.append("personId", nasabah.personId); // Use personId from the relationship

    try {
      const result = await changeNasabahPasswordAction(formData);

      if (result.error) {
        setMessage({ type: "error", text: result.error });
      } else {
        setMessage({
          type: "success",
          text: result.message || "Password berhasil diubah!",
        });
        // Reset form
        const form = document.getElementById(
          "change-password-form",
        ) as HTMLFormElement;
        form?.reset();
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: "Terjadi kesalahan saat mengubah password",
      });
    } finally {
      setLoading(false);
      // Clear message after 5 seconds
      setTimeout(() => setMessage(null), 5000);
    }
  }

  const togglePasswordVisibility = (field: "current" | "new" | "confirm") => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lock className="h-5 w-5" />
          Ganti Password
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form
          id="change-password-form"
          action={handleSubmit}
          className="space-y-4"
        >
          {/* Password Lama */}
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Password Lama</Label>
            <div className="relative">
              <Input
                id="currentPassword"
                name="currentPassword"
                type={showPasswords.current ? "text" : "password"}
                placeholder="Masukkan password lama"
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => togglePasswordVisibility("current")}
              >
                {showPasswords.current ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Password Baru */}
          <div className="space-y-2">
            <Label htmlFor="newPassword">Password Baru</Label>
            <div className="relative">
              <Input
                id="newPassword"
                name="newPassword"
                type={showPasswords.new ? "text" : "password"}
                placeholder="Masukkan password baru (min. 6 karakter)"
                minLength={6}
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => togglePasswordVisibility("new")}
              >
                {showPasswords.new ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Konfirmasi Password Baru */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Konfirmasi Password Baru</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showPasswords.confirm ? "text" : "password"}
                placeholder="Ulangi password baru"
                minLength={6}
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => togglePasswordVisibility("confirm")}
              >
                {showPasswords.confirm ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
            <p className="font-medium text-blue-900">Tips Keamanan:</p>
            <ul className="text-blue-700 mt-1 space-y-1">
              <li>• Password minimal 6 karakter</li>
              <li>• Gunakan kombinasi huruf dan angka</li>
              <li>• Jangan gunakan password yang mudah ditebak</li>
            </ul>
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
            Ubah Password
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
