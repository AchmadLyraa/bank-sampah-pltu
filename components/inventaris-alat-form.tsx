"use client";
import { useState, useEffect } from "react";
import {
  addInventarisAlat,
  updateInventarisAlat,
  getInventarisAlatById,
} from "@/app/actions/inventaris-management";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Pencil, Plus } from "lucide-react";

interface InventarisAlatFormProps {
  editId?: string;
  onSuccess?: () => void;
}

export default function InventarisAlatForm({
  editId,
  onSuccess,
}: InventarisAlatFormProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    nama: "",
    jenis: "",
    jenisCustom: "", // 🆕 Custom jenis input
    merk: "",
    kondisi: "",
    hargaBeli: "",
    metodePerolehan: "",
  });

  // 🎯 Predefined Options
  const jenisOptions = [
    "Peralatan Elektronik",
    "Alat Rumah Tangga",
    "Kendaraan",
    "Alat Kebersihan",
    "Alat Pertukangan",
    "Peralatan Kantor",
    "Mesin Industri",
    "Peralatan Komputer",
    "custom", // Option untuk custom input
  ];

  const kondisiOptions = [
    "Baik",
    "Kurang Baik",
    "Rusak Ringan",
    "Rusak Berat",
    "Perlu Perbaikan",
  ];

  const isEditMode = !!editId;

  // Load data for editing
  useEffect(() => {
    if (isEditMode && open && editId) {
      loadInventarisData(editId);
    }
  }, [editId, open, isEditMode]);

  async function loadInventarisData(id: string) {
    try {
      setLoading(true);
      const data = await getInventarisAlatById(id);
      setForm({
        nama: data.nama,
        jenis: jenisOptions.includes(data.jenis) ? data.jenis : "custom",
        jenisCustom: jenisOptions.includes(data.jenis) ? "" : data.jenis,
        merk: data.merk || "",
        kondisi: data.kondisi,
        hargaBeli: data.hargaBeli.toString(),
        metodePerolehan: data.metodePerolehan,
      });
    } catch (error) {
      console.error("Error loading inventaris data:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = {
        nama: form.nama,
        jenis: form.jenis === "custom" ? form.jenisCustom : form.jenis, // 🎯 Logic untuk custom jenis
        merk: form.merk,
        kondisi: form.kondisi,
        hargaBeli: Number(form.hargaBeli),
        metodePerolehan: form.metodePerolehan,
      };

      if (isEditMode && editId) {
        await updateInventarisAlat(editId, formData);
      } else {
        await addInventarisAlat(formData);
      }

      // Reset form
      setForm({
        nama: "",
        jenis: "",
        jenisCustom: "",
        merk: "",
        kondisi: "",
        hargaBeli: "",
        metodePerolehan: "",
      });

      setOpen(false);
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Error saving inventaris:", error);
    } finally {
      setLoading(false);
    }
  }

  function handleOpenChange(newOpen: boolean) {
    setOpen(newOpen);
    if (!newOpen && !isEditMode) {
      // Reset form only if not in edit mode or closing
      setForm({
        nama: "",
        jenis: "",
        jenisCustom: "",
        merk: "",
        kondisi: "",
        hargaBeli: "",
        metodePerolehan: "",
      });
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {isEditMode ? (
          <Button variant="outline" size="sm">
            <Pencil className="h-4 w-4" />
          </Button>
        ) : (
          <Button variant="default">
            <Plus className="h-4 w-4 mr-2" />
            Tambah Alat
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Edit Inventaris Alat" : "Tambah Inventaris Alat"}
          </DialogTitle>
        </DialogHeader>

        {loading && isEditMode ? (
          <div className="flex items-center justify-center p-6">
            <div className="text-sm text-muted-foreground">Loading...</div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nama Alat */}
            <div>
              <Input
                placeholder="Nama Alat *"
                value={form.nama}
                onChange={(e) => setForm({ ...form, nama: e.target.value })}
                required
              />
            </div>

            {/* Jenis Alat - Select Dropdown */}
            <div className="space-y-2">
              <Select
                value={form.jenis}
                onValueChange={(value) =>
                  setForm({ ...form, jenis: value, jenisCustom: "" })
                }
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Jenis Alat *" />
                </SelectTrigger>
                <SelectContent>
                  {jenisOptions.map((jenis) => (
                    <SelectItem key={jenis} value={jenis}>
                      {jenis === "custom" ? "🔧 Tulis Sendiri" : jenis}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Custom Jenis Input - Muncul ketika pilih "custom" */}
              {form.jenis === "custom" && (
                <Input
                  placeholder="Tulis jenis alat custom *"
                  value={form.jenisCustom}
                  onChange={(e) =>
                    setForm({ ...form, jenisCustom: e.target.value })
                  }
                  required
                  className="mt-2"
                />
              )}
            </div>

            {/* Merk */}
            <div>
              <Input
                placeholder="Merk (Opsional)"
                value={form.merk}
                onChange={(e) => setForm({ ...form, merk: e.target.value })}
              />
            </div>

            {/* Kondisi - Select Dropdown */}
            <div>
              <Select
                value={form.kondisi}
                onValueChange={(value) => setForm({ ...form, kondisi: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Kondisi Alat *" />
                </SelectTrigger>
                <SelectContent>
                  {kondisiOptions.map((kondisi) => (
                    <SelectItem key={kondisi} value={kondisi}>
                      <span
                        className={`flex items-center gap-2 ${
                          kondisi === "Baik"
                            ? "text-green-600"
                            : kondisi === "Kurang Baik" ||
                                kondisi === "Perlu Perbaikan"
                              ? "text-yellow-600"
                              : "text-red-600"
                        }`}
                      >
                        <span
                          className={`w-2 h-2 rounded-full ${
                            kondisi === "Baik"
                              ? "bg-green-500"
                              : kondisi === "Kurang Baik" ||
                                  kondisi === "Perlu Perbaikan"
                                ? "bg-yellow-500"
                                : "bg-red-500"
                          }`}
                        ></span>
                        {kondisi}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Harga Beli */}
            <div>
              <Input
                placeholder="Harga Beli (Rp) *"
                type="number"
                min="0"
                step="1000"
                value={form.hargaBeli}
                onChange={(e) =>
                  setForm({ ...form, hargaBeli: e.target.value })
                }
                required
              />
            </div>

            {/* Metode Perolehan */}
            <div>
              <Input
                placeholder="Metode Perolehan (Contoh: Beli, Hibah, Sewa) *"
                value={form.metodePerolehan}
                onChange={(e) =>
                  setForm({ ...form, metodePerolehan: e.target.value })
                }
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading
                ? "Menyimpan..."
                : isEditMode
                  ? "Update Alat"
                  : "Simpan Alat"}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
