"use client";

import type React from "react";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NasabahCombobox } from "@/components/nasabah-combobox";
import { penarikanAction } from "@/app/actions/bank-sampah";
import { Loader2, CreditCard } from "lucide-react";
import type { Nasabah } from "@/types";

interface PenarikanFormProps {
  nasabahList: Nasabah[];
}

export default function PenarikanForm({ nasabahList }: PenarikanFormProps) {
  const [selectedNasabah, setSelectedNasabah] = useState("");
  const [jumlah, setJumlah] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const selectedNasabahData = nasabahList.find((n) => n.id === selectedNasabah);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedNasabah || jumlah <= 0) {
      alert("Mohon lengkapi semua data");
      return;
    }

    if (selectedNasabahData && jumlah > selectedNasabahData.saldo) {
      alert("Jumlah penarikan melebihi saldo nasabah");
      return;
    }

    setLoading(true);
    try {
      await penarikanAction({ nasabahId: selectedNasabah, jumlah });
      setSuccess(true);
      setSelectedNasabah("");
      setJumlah(0);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      alert("Terjadi kesalahan saat memproses penarikan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Form Penarikan Saldo
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label>Pilih Nasabah</Label>
            <NasabahCombobox
              nasabahList={nasabahList}
              value={selectedNasabah}
              onValueChange={setSelectedNasabah}
              placeholder="Cari nasabah yang ingin menarik saldo..."
            />
          </div>

          {selectedNasabahData && (
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-medium text-blue-900">Informasi Nasabah</h3>
              <p className="text-sm text-blue-700">
                Nama: {selectedNasabahData.nama}
              </p>
              <p className="text-sm text-blue-700">
                Saldo: Rp {selectedNasabahData.saldo.toLocaleString()}
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="jumlah">Jumlah Penarikan</Label>
            <Input
              id="jumlah"
              type="text" // Ganti ke text biar bisa format titik
              value={jumlah > 0 ? jumlah.toLocaleString("id-ID") : ""} // Format ribuan
              onChange={(e) => {
                // Ambil nilai mentah, hapus semua non-digit
                const rawValue = e.target.value.replace(/\D/g, "");
                const numericValue = rawValue
                  ? Number.parseInt(rawValue, 10)
                  : 0;
                setJumlah(numericValue);
              }}
              placeholder="Masukkan jumlah penarikan"
              min="1"
              max={selectedNasabahData?.saldo || 0}
            />
            {selectedNasabahData && jumlah > 0 && (
              <p className="text-sm text-gray-600">
                Sisa saldo setelah penarikan: Rp{" "}
                {(selectedNasabahData.saldo - jumlah).toLocaleString("id-ID")}
              </p>
            )}
          </div>

          {success && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
              Penarikan berhasil diproses!
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={loading || !selectedNasabah || jumlah <= 0}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Proses Penarikan
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
