"use client";

import { useState } from "react";
import { createGeneralTransaction } from "@/app/actions/general-transaction";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ChevronsUpDown, Check } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";

const jenisOptions = [
  { value: "PEMASUKAN_UMUM", label: "Pemasukan Umum" },
  { value: "PENGELUARAN_UMUM", label: "Pengeluaran Umum" },
];

export default function GeneralTransactionForm({
  bankSampahId,
}: {
  bankSampahId: string;
}) {
  const [jenis, setJenis] = useState("");
  const [open, setOpen] = useState(false);
  const [keterangan, setKeterangan] = useState("");
  const [totalNilai, setTotalNilai] = useState<number | "">("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!jenis || !keterangan || !totalNilai || Number(totalNilai) <= 0) {
      setErrorMsg("Mohon lengkapi semua data!");
      return;
    }

    setLoading(true);
    setErrorMsg("");
    try {
      const formData = new FormData();
      formData.append("bankSampahId", bankSampahId);
      formData.append("jenis", jenis);
      formData.append("keterangan", keterangan);
      formData.append("totalNilai", totalNilai.toString());

      const res = await createGeneralTransaction(formData);

      if ("error" in res) {
        setErrorMsg(res.error);
      } else {
        setSuccess(true);
        setJenis("");
        setKeterangan("");
        setTotalNilai("");
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err) {
      setErrorMsg("Terjadi kesalahan saat menyimpan transaksi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tambah Transaksi Umum</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 🆕 Combobox elegan untuk pilih jenis */}
          <div className="space-y-2">
            <Label>Jenis Transaksi</Label>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  className={cn(
                    "w-full justify-between",
                    !jenis && "text-muted-foreground",
                  )}
                >
                  {jenis
                    ? jenisOptions.find((opt) => opt.value === jenis)?.label
                    : "Pilih jenis transaksi..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                <Command>
                  <CommandEmpty>Tidak ditemukan</CommandEmpty>
                  <CommandGroup>
                    {jenisOptions.map((opt) => (
                      <CommandItem
                        key={opt.value}
                        value={opt.value}
                        onSelect={() => {
                          setJenis(opt.value);
                          setOpen(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            jenis === opt.value ? "opacity-100" : "opacity-0",
                          )}
                        />
                        {opt.label}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label>Keterangan</Label>
            <Input
              value={keterangan}
              onChange={(e) => setKeterangan(e.target.value)}
              placeholder="Contoh: Gaji karyawan, Biaya operasional"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Total Nilai</Label>
            <Input
              type="text" // ← ubah dari "number" ke "text"
              value={
                totalNilai === "" || totalNilai === 0
                  ? ""
                  : `Rp ${Number(totalNilai).toLocaleString("id-ID")}`
              }
              onChange={(e) => {
                const rawValue = e.target.value.replace(/[^\d]/g, "");
                setTotalNilai(rawValue === "" ? "" : Number(rawValue));
              }}
              placeholder="Rp 0" // ← ubah placeholder
              required
            />
          </div>

          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700">
              {errorMsg}
            </div>
          )}

          {success && (
            <div className="p-3 bg-green-50 border border-green-200 rounded text-green-700">
              Transaksi berhasil disimpan!
            </div>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Simpan Transaksi
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
