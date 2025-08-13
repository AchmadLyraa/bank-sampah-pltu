"use client";

import type React from "react";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Edit } from "lucide-react";
import { updateInventarisSampah } from "@/app/actions/controller";

interface EditInventarisDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  inventaris: any;
  onSuccess: () => void;
}

export function EditInventarisDialog({
  open,
  onOpenChange,
  inventaris,
  onSuccess,
}: EditInventarisDialogProps) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [formData, setFormData] = useState({
    jenisSampah: "",
    hargaPerKg: "",
    stokKg: "",
    isActive: true,
  });

  useEffect(() => {
    if (inventaris) {
      setFormData({
        jenisSampah: inventaris.jenisSampah || "",
        hargaPerKg: inventaris.hargaPerKg?.toString() || "",
        stokKg: inventaris.stokKg?.toString() || "",
        isActive: inventaris.isActive ?? true,
      });
    }
  }, [inventaris]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const submitFormData = new FormData();
    submitFormData.append("inventarisId", inventaris.id);
    submitFormData.append("jenisSampah", formData.jenisSampah);
    submitFormData.append("hargaPerKg", formData.hargaPerKg);
    submitFormData.append("stokKg", formData.stokKg);
    submitFormData.append("isActive", formData.isActive.toString());

    try {
      const result = await updateInventarisSampah(submitFormData);
      if (result.success) {
        setMessage("Inventaris berhasil diperbarui!");
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

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5" />
            Edit Inventaris Sampah
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="jenisSampah">Jenis Sampah</Label>
            <Input
              id="jenisSampah"
              value={formData.jenisSampah}
              onChange={(e) => handleInputChange("jenisSampah", e.target.value)}
              required
              placeholder="Masukkan jenis sampah"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="hargaPerKg">Harga per Kg (Rp)</Label>
            <Input
              id="hargaPerKg"
              type="number"
              min="0"
              step="100"
              value={formData.hargaPerKg}
              onChange={(e) => handleInputChange("hargaPerKg", e.target.value)}
              required
              placeholder="Masukkan harga per kg"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="stokKg">Stok (Kg)</Label>
            <Input
              id="stokKg"
              type="number"
              min="0"
              step="0.1"
              value={formData.stokKg}
              onChange={(e) => handleInputChange("stokKg", e.target.value)}
              required
              placeholder="Masukkan stok dalam kg"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) =>
                handleInputChange("isActive", checked)
              }
            />
            <Label htmlFor="isActive">Status Aktif</Label>
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
              {loading ? "Menyimpan..." : "Simpan Perubahan"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
