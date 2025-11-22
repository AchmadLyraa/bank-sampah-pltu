"use client";

import type React from "react";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { NasabahCombobox } from "@/components/nasabah-combobox";
import { penimbanganAction } from "@/app/actions/bank-sampah";
import { Plus, Trash2, Loader2 } from "lucide-react";
import type { Nasabah, InventarisSampah } from "@/types";

interface PenimbanganFormProps {
  nasabahList: Nasabah[];
  inventarisList: InventarisSampah[];
}

interface PenimbanganItem {
  inventarisSampahId: string;
  jumlahUnit: number;
}

export default function PenimbanganForm({
  nasabahList,
  inventarisList,
}: PenimbanganFormProps) {
  const [selectedNasabah, setSelectedNasabah] = useState("");
  const [items, setItems] = useState<PenimbanganItem[]>([
    { inventarisSampahId: "", jumlahUnit: 0 },
  ]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const addItem = () => {
    setItems([...items, { inventarisSampahId: "", jumlahUnit: 0 }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (
    index: number,
    field: keyof PenimbanganItem,
    value: string | number,
  ) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const calculateTotal = () => {
    return items.reduce((total, item) => {
      const inventaris = inventarisList.find(
        (inv) => inv.id === item.inventarisSampahId,
      );
      return (
        total + (inventaris ? item.jumlahUnit * inventaris.hargaPerUnit : 0)
      );
    }, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !selectedNasabah ||
      items.some((item) => !item.inventarisSampahId || item.jumlahUnit <= 0)
    ) {
      alert("Mohon lengkapi semua data");
      return;
    }

    setShowConfirm(true);
  };

  const handleConfirm = async () => {
    setShowConfirm(false);
    setLoading(true);
    try {
      await penimbanganAction({
        nasabahId: selectedNasabah,
        items: items.filter(
          (item) => item.inventarisSampahId && item.jumlahUnit > 0,
        ),
      });
      setSuccess(true);
      setSelectedNasabah("");
      setItems([{ inventarisSampahId: "", jumlahUnit: 0 }]);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      alert("Terjadi kesalahan saat menyimpan data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Form Penimbangan</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label>Pilih Nasabah</Label>
            <NasabahCombobox
              nasabahList={nasabahList}
              value={selectedNasabah}
              onValueChange={setSelectedNasabah}
              placeholder="Cari dan pilih nasabah..."
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Item Sampah</Label>
              <Button
                type="button"
                onClick={addItem}
                size="sm"
                variant="outline"
              >
                <Plus className="h-4 w-4 mr-2" />
                Tambah Item
              </Button>
            </div>

            {items.map((item, index) => {
              const selectedInventaris = inventarisList.find(
                (inv) => inv.id === item.inventarisSampahId,
              );
              const satuanLabel =
                selectedInventaris?.satuan === "KG" ? "kg" : "pcs";
              const satuanEmoji =
                selectedInventaris?.satuan === "KG" ? "🪣" : "📦";

              return (
                <div
                  key={index}
                  className="flex gap-4 items-end p-4 border rounded-lg flex-wrap"
                >
                  <div className="flex-1 min-w-[200px]">
                    <Label>Jenis Sampah</Label>
                    <Select
                      value={item.inventarisSampahId}
                      onValueChange={(value) =>
                        updateItem(index, "inventarisSampahId", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih jenis sampah..." />
                      </SelectTrigger>
                      <SelectContent>
                        {inventarisList.map((inventaris) => (
                          <SelectItem key={inventaris.id} value={inventaris.id}>
                            {inventaris.jenisSampah} - Rp{" "}
                            {inventaris.hargaPerUnit.toLocaleString()}/
                            {inventaris.satuan === "KG" ? "kg" : "pcs"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="w-32">
                    <Label>Jumlah ({satuanLabel})</Label>
                    <Input
                      type="number"
                      step={selectedInventaris?.satuan === "KG" ? "0.1" : "1"}
                      min="0"
                      value={item.jumlahUnit || ""}
                      onChange={(e) =>
                        updateItem(
                          index,
                          "jumlahUnit",
                          Number.parseFloat(e.target.value) || 0,
                        )
                      }
                      placeholder="0"
                    />
                  </div>

                  <div className="w-40">
                    <Label>Subtotal</Label>
                    <div className="h-10 px-3 py-2 border rounded-md bg-gray-50 text-sm">
                      Rp{" "}
                      {(() => {
                        const inv = inventarisList.find(
                          (iv) => iv.id === item.inventarisSampahId,
                        );
                        return inv
                          ? (
                              item.jumlahUnit * inv.hargaPerUnit
                            ).toLocaleString()
                          : "0";
                      })()}
                    </div>
                  </div>

                  {items.length > 1 && (
                    <Button
                      type="button"
                      onClick={() => removeItem(index)}
                      size="sm"
                      variant="destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
            <span className="text-lg font-semibold">Total:</span>
            <span className="text-xl font-bold text-green-600">
              Rp {calculateTotal().toLocaleString()}
            </span>
          </div>

          {success && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
              Penimbangan berhasil disimpan!
            </div>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Simpan Penimbangan
          </Button>
          <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Konfirmasi Penimbangan</DialogTitle>
              </DialogHeader>

              <div className="space-y-3 max-h-60 overflow-y-auto">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm font-medium">
                    Nasabah:{" "}
                    {nasabahList.find((n) => n.id === selectedNasabah)?.person
                      ?.nama || "-"}
                  </p>
                </div>

                {items
                  .filter(
                    (item) => item.inventarisSampahId && item.jumlahUnit > 0,
                  )
                  .map((item, idx) => {
                    const inv = inventarisList.find(
                      (i) => i.id === item.inventarisSampahId,
                    );
                    return (
                      <div
                        key={idx}
                        className="p-3 bg-gray-50 rounded-lg text-sm"
                      >
                        <p className="font-medium">{inv?.jenisSampah}</p>
                        <p className="text-gray-600">
                          {item.jumlahUnit}{" "}
                          {inv?.satuan === "KG" ? "kg" : "pcs"} @ Rp{" "}
                          {inv?.hargaPerUnit.toLocaleString()}
                        </p>
                        <p className="text-green-600 font-semibold">
                          = Rp{" "}
                          {(
                            item.jumlahUnit * (inv?.hargaPerUnit || 0)
                          ).toLocaleString()}
                        </p>
                      </div>
                    );
                  })}

                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-sm text-gray-600">Total:</p>
                  <p className="text-xl font-bold text-green-600">
                    Rp {calculateTotal().toLocaleString()}
                  </p>
                </div>
              </div>

              <DialogFooter className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setShowConfirm(false)}>
                  Batal
                </Button>
                <Button onClick={handleConfirm} disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Ya, Simpan
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </form>
      </CardContent>
    </Card>
  );
}
