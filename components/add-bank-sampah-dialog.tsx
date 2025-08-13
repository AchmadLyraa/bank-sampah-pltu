"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createBankSampah } from "@/app/actions/controller";
import { Eye, EyeOff } from "lucide-react";

interface AddBankSampahDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function AddBankSampahDialog({
  open,
  onOpenChange,
  onSuccess,
}: AddBankSampahDialogProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = async (formData: FormData) => {
    if (password !== confirmPassword) {
      setError("Password dan konfirmasi password tidak sama");
      return;
    }

    const latitude = formData.get("latitude") as string;
    const longitude = formData.get("longitude") as string;

    if (latitude && longitude) {
      const lat = Number.parseFloat(latitude);
      const lng = Number.parseFloat(longitude);

      if (lat < -11 || lat > 6) {
        setError(
          "Latitude harus berada dalam batas Indonesia (-11° hingga 6°)",
        );
        return;
      }
      if (lng < 95 || lng > 141) {
        setError(
          "Longitude harus berada dalam batas Indonesia (95° hingga 141°)",
        );
        return;
      }
    }

    setLoading(true);
    setError("");

    try {
      const result = await createBankSampah(formData);

      if (result.success) {
        onSuccess?.();
        onOpenChange(false);
        setPassword("");
        setConfirmPassword("");
      } else {
        setError(result.error || "Terjadi kesalahan");
      }
    } catch (error) {
      setError("Terjadi kesalahan sistem");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[82vh] h-full overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Tambah Bank Sampah</DialogTitle>
          <DialogDescription>
            Tambahkan bank sampah baru ke sistem
          </DialogDescription>
        </DialogHeader>

        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nama">Nama Bank Sampah</Label>
            <Input
              id="nama"
              name="nama"
              placeholder="Masukkan nama bank sampah"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="alamat">Alamat</Label>
            <Input
              id="alamat"
              name="alamat"
              placeholder="Masukkan alamat lengkap"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="telepon">Telepon</Label>
            <Input
              id="telepon"
              name="telepon"
              placeholder="Masukkan nomor telepon"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="Masukkan email"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Masukkan password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" />
                )}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Konfirmasi Password</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Masukkan ulang password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" />
                )}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="latitude">Latitude (Opsional)</Label>
              <Input
                id="latitude"
                name="latitude"
                type="number"
                step="any"
                placeholder="-6.2088"
              />
              <p className="text-xs text-gray-500">
                Batas Indonesia: -11° hingga 6°
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="longitude">Longitude (Opsional)</Label>
              <Input
                id="longitude"
                name="longitude"
                type="number"
                step="any"
                placeholder="106.8456"
              />
              <p className="text-xs text-gray-500">
                Batas Indonesia: 95° hingga 141°
              </p>
            </div>
          </div>

          {error && <div className="text-red-600 text-sm">{error}</div>}

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-green-600 hover:bg-green-700"
            >
              {loading ? "Menyimpan..." : "Simpan"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
