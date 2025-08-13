"use client";

import type React from "react";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Eye, EyeOff, UserPlus } from "lucide-react";
import { addNasabahToBank } from "@/app/actions/controller";

interface AddNasabahDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bankSampahId: string;
  bankSampahName: string;
  onSuccess: () => void;
}

export function AddNasabahDialog({
  open,
  onOpenChange,
  bankSampahId,
  bankSampahName,
  onSuccess,
}: AddNasabahDialogProps) {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const formData = new FormData(e.currentTarget);
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (password !== confirmPassword) {
      setMessage("Password dan konfirmasi password tidak sama");
      setLoading(false);
      return;
    }

    // Add bankSampahId to formData
    formData.append("bankSampahId", bankSampahId);

    try {
      const result = await addNasabahToBank(formData);
      if (result.success) {
        setMessage("Nasabah berhasil ditambahkan!");
        onSuccess();
        setTimeout(() => {
          onOpenChange(false);
          setMessage("");
        }, 1500);
      } else {
        setMessage(result.error || "Terjadi kesalahan");
      }
    } catch (error) {
      setMessage("Terjadi kesalahan sistem");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Tambah Nasabah ke {bankSampahName}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nama">Nama Lengkap</Label>
            <Input
              id="nama"
              name="nama"
              type="text"
              required
              placeholder="Masukkan nama lengkap"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              placeholder="Masukkan email"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="telepon">Nomor Telepon</Label>
            <Input
              id="telepon"
              name="telepon"
              type="tel"
              required
              placeholder="Masukkan nomor telepon"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="alamat">Alamat</Label>
            <Textarea
              id="alamat"
              name="alamat"
              required
              placeholder="Masukkan alamat lengkap"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                required
                placeholder="Masukkan password"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
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
                required
                placeholder="Konfirmasi password"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {message && (
            <div
              className={`text-sm ${message.includes("berhasil") ? "text-green-600" : "text-red-600"}`}
            >
              {message}
            </div>
          )}

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Batal
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? "Menambahkan..." : "Tambah Nasabah"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
