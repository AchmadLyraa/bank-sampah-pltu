"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { createNasabahAction } from "@/app/actions/nasabah-management";
import { UserPlus, Loader2, Eye, EyeOff } from "lucide-react";

interface TambahNasabahModalProps {
  bankSampahId: string;
}

export default function TambahNasabahModal({
  bankSampahId,
}: TambahNasabahModalProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordMismatch, setPasswordMismatch] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setMessage(null);

    const password = formData.get("password");
    const confirmPassword = formData.get("confirmPassword");

    if (password !== confirmPassword) {
      setMessage({
        type: "error",
        text: "Password dan konfirmasi password tidak cocok",
      });
      setLoading(false);
      return;
    }

    formData.append("bankSampahId", bankSampahId);
    // Hapus confirmPassword dari formData agar backend tidak bingung
    formData.delete("confirmPassword");

    try {
      const result = await createNasabahAction(formData);

      if (result.error) {
        setMessage({ type: "error", text: result.error });
      } else {
        setMessage({ type: "success", text: "Nasabah berhasil ditambahkan!" });
        const form = document.getElementById(
          "modal-tambah-nasabah-form",
        ) as HTMLFormElement;
        form?.reset();
        setTimeout(() => {
          setOpen(false);
          setMessage(null);
        }, 1500);
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: "Terjadi kesalahan saat menambahkan nasabah",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <UserPlus className="h-4 w-4" />
          Tambah Nasabah
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Tambah Nasabah Baru
          </DialogTitle>
        </DialogHeader>

        <form
          id="modal-tambah-nasabah-form"
          action={handleSubmit}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="modal-nama">Nama Lengkap</Label>
            <Input
              id="modal-nama"
              name="nama"
              placeholder="Masukkan nama lengkap"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="modal-nik">NIK (Nomor Induk Kependudukan)</Label>
            <Input
              id="modal-nik"
              name="nik"
              placeholder="Masukkan 16 digit NIK"
              // pattern="[0-9]{16}"
              minLength={1}
              maxLength={16}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="modal-email">Email</Label>
            <Input
              id="modal-email"
              name="email"
              type="email"
              placeholder="email@example.com"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="modal-password">Password</Label>
            <div className="relative">
              <Input
                id="modal-password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Password untuk login"
                required
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="modal-confirm-password">Konfirmasi Password</Label>
            <div className="relative">
              <Input
                id="modal-confirm-password"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Konfirmasi password"
                required
                className="pr-10"
                onChange={(e) => {
                  setPasswordMismatch(
                    e.target.value !==
                      document.getElementById("modal-password")?.value,
                  );
                }}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
            {passwordMismatch && (
              <p className="text-sm text-red-600">
                Password dan konfirmasi password tidak cocok
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="modal-telepon">Telepon</Label>
            <Input
              id="modal-telepon"
              name="telepon"
              placeholder="08xxxxxxxxxx"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="modal-alamat">Alamat</Label>
            <Textarea
              id="modal-alamat"
              name="alamat"
              placeholder="Alamat lengkap nasabah"
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

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1"
              disabled={loading}
            >
              Batal
            </Button>
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Tambah Nasabah
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
