"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Plus } from "lucide-react";
import { createInventarisAction } from "@/app/actions/inventaris-management";
import type { SatuanUkuran } from "@/types";

interface TambahInventarisModalProps {
  bankSampahId: string;
}

export default function TambahInventarisModal({
  bankSampahId,
}: TambahInventarisModalProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    jenisSampah: "",
    satuan: "KG" as SatuanUkuran,
    hargaPerUnit: "",
  });
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError(null);
  };

  const handleSatuanChange = (value: SatuanUkuran) => {
    setFormData((prev) => ({
      ...prev,
      satuan: value,
    }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.jenisSampah.trim()) {
      setError("Nama jenis sampah harus diisi");
      return;
    }

    if (formData.hargaPerUnit === "" || Number(formData.hargaPerUnit) < 0) {
      setError("Harga per unit harus lebih dari 0");
      return;
    }

    setLoading(true);

    const data = new FormData();
    data.append("jenisSampah", formData.jenisSampah.trim());
    data.append("satuan", formData.satuan);
    data.append("hargaPerUnit", formData.hargaPerUnit);
    data.append("bankSampahId", bankSampahId);

    const result = await createInventarisAction(data);

    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      setOpen(false);
      setFormData({
        jenisSampah: "",
        satuan: "KG",
        hargaPerUnit: "",
      });
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Tambah Inventaris
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Tambah Jenis Sampah Baru</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded text-red-800 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="jenisSampah">Jenis Sampah</Label>
            <Input
              id="jenisSampah"
              name="jenisSampah"
              placeholder="misal: Plastik, Kertas, dll"
              value={formData.jenisSampah}
              onChange={handleInputChange}
              disabled={loading}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="satuan">Satuan Ukuran</Label>
            <Select value={formData.satuan} onValueChange={handleSatuanChange}>
              <SelectTrigger id="satuan">
                <SelectValue placeholder="Pilih satuan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="KG">🪣 Kilogram (kg)</SelectItem>
                <SelectItem value="PCS">📦 Pieces (pcs)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="hargaPerUnit">
              Harga per {formData.satuan === "KG" ? "kg" : "pcs"}
            </Label>
            <div className="flex items-center">
              <span className="text-gray-500 mr-2">Rp</span>
              <Input
                id="hargaPerUnit"
                name="hargaPerUnit"
                type="number"
                min="0"
                step="100"
                placeholder="0"
                value={formData.hargaPerUnit}
                onChange={handleInputChange}
                disabled={loading}
                required
                className="flex-1"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
              className="flex-1"
            >
              Batal
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Tambah
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
