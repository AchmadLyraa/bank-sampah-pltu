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
import { Package, Loader2 } from "lucide-react";
import { addInventarisSampah } from "@/app/actions/controller";

interface AddInventarisDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bankSampahId: string;
  bankSampahName: string;
  onSuccess: () => void;
}

export function AddInventarisDialog({
  open,
  onOpenChange,
  bankSampahId,
  bankSampahName,
  onSuccess,
}: AddInventarisDialogProps) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const formData = new FormData(e.currentTarget);
    formData.append("bankSampahId", bankSampahId);

    try {
      const result = await addInventarisSampah(formData);

      if (result.success) {
        setMessage("Jenis sampah berhasil ditambahkan!");
        onSuccess();
        setTimeout(() => {
          onOpenChange(false);
          setMessage("");
        }, 1500);
      } else {
        setMessage(result.message || "Gagal menambahkan jenis sampah");
      }
    } catch (error) {
      setMessage("Terjadi kesalahan saat menambahkan jenis sampah");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Tambah Jenis Sampah - {bankSampahName}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="jenisSampah">Jenis Sampah</Label>
            <Input
              id="jenisSampah"
              name="jenisSampah"
              placeholder="Contoh: Plastik Botol, Kertas Koran, dll"
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="satuan">Satuan Ukuran</Label>
            <select
              id="satuan"
              name="satuan"
              defaultValue="KG"
              className="w-full px-3 py-2 border rounded-md"
              disabled={loading}
              required
            >
              <option value="KG">Kilogram (kg)</option>
              <option value="PCS">Pieces (pcs)</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="hargaPerUnit">Harga per Unit (Rp)</Label>
            <Input
              id="hargaPerUnit"
              name="hargaPerUnit"
              type="number"
              step="0.01"
              min="0"
              placeholder="5000"
              required
              disabled={loading}
            />
          </div>
          <input type="hidden" name="stokUnit" value="0" />

          {message && (
            <div
              className={`text-sm p-2 rounded ${
                message.includes("berhasil")
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {message}
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className="flex-1"
            >
              Batal
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Menambahkan...
                </>
              ) : (
                "Tambah Jenis Sampah"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
