"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Users,
  Mail,
  Phone,
  MapPin,
  Wallet,
  Search,
  Power,
  PowerOff,
  Loader2,
  CreditCard,
} from "lucide-react";
import { toggleNasabahStatusAction } from "@/app/actions/nasabah-management";
import type { Nasabah } from "@/types";

interface NasabahListWithSearchProps {
  nasabahList: Nasabah[];
}

export default function NasabahListWithSearch({
  nasabahList,
}: NasabahListWithSearchProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [toggleLoading, setToggleLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const filteredNasabah = useMemo(() => {
    if (!searchTerm) return nasabahList;

    const term = searchTerm.toLowerCase();
    return nasabahList.filter(
      (nasabah) =>
        nasabah.nama.toLowerCase().includes(term) ||
        nasabah.email.toLowerCase().includes(term) ||
        nasabah.nik.includes(term) || // 🆕 Search by NIK
        nasabah.telepon.includes(term) ||
        nasabah.alamat.toLowerCase().includes(term),
    );
  }, [nasabahList, searchTerm]);

  const handleToggleStatus = async (nasabah: Nasabah) => {
    const newStatus = !nasabah.isActive;
    const confirmMessage = newStatus
      ? `Aktifkan kembali "${nasabah.nama}"?\n\nNasabah ini akan muncul kembali di daftar dan bisa melakukan transaksi.`
      : `Non-aktifkan "${nasabah.nama}"?\n\nNasabah ini akan disembunyikan dari daftar dan tidak bisa melakukan transaksi baru.`;

    if (!confirm(confirmMessage)) return;

    setToggleLoading(nasabah.id);
    const formData = new FormData();
    formData.append("id", nasabah.id);
    formData.append("isActive", nasabah.isActive.toString());

    try {
      const result = await toggleNasabahStatusAction(formData);
      if (result.error) {
        alert(result.error);
      } else {
        setMessage({
          type: "success",
          text: `${nasabah.nama} berhasil ${newStatus ? "diaktifkan" : "dinonaktifkan"}!`,
        });
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (error) {
      alert("Terjadi kesalahan saat mengubah status nasabah");
    } finally {
      setToggleLoading(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Success/Error Message */}
      {message && (
        <div
          className={`p-4 rounded-lg border ${
            message.type === "success"
              ? "bg-green-50 text-green-800 border-green-200"
              : "bg-red-50 text-red-800 border-red-200"
          }`}
        >
          {message.text}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Daftar Nasabah ({filteredNasabah.length})
          </CardTitle>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Cari nasabah (nama, email, NIK, telepon, alamat)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        <CardContent>
          {filteredNasabah.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              {searchTerm ? (
                <>
                  <p>
                    Tidak ada nasabah yang cocok dengan pencarian "{searchTerm}"
                  </p>
                  <p className="text-sm">
                    Coba kata kunci lain atau hapus filter pencarian
                  </p>
                </>
              ) : (
                <>
                  <p>Belum ada nasabah terdaftar</p>
                  <p className="text-sm">
                    Tambahkan nasabah pertama menggunakan tombol "Tambah
                    Nasabah"
                  </p>
                </>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredNasabah.map((nasabah) => (
                <div
                  key={nasabah.id}
                  className={`border rounded-lg p-4 transition-colors ${
                    !nasabah.isActive
                      ? "bg-gray-50 opacity-75"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-start justify-between mb-3 flex-wrap sm:flex-row flex-col">
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900">
                        {nasabah.nama}
                      </h3>
                      <div className="flex sm:items-center items-start sm:gap-4 gap-0 sm:flex-row flex-col text-sm text-gray-600 mt-1">
                        <Badge
                          variant={nasabah.isActive ? "default" : "secondary"}
                          className={
                            nasabah.isActive
                              ? "bg-green-100 text-green-800"
                              : ""
                          }
                        >
                          {nasabah.isActive ? "Aktif" : "Non-aktif"}
                        </Badge>
                        {/* 🆕 NIK Display */}
                        <div className="flex items-center gap-1 text-sm text-gray-600 mb-1">
                          <CreditCard className="h-3 w-3" />
                          <span className="font-medium">NIK:</span>{" "}
                          {nasabah.nik}
                        </div>
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {nasabah.email}
                        </span>
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {nasabah.telepon}
                        </span>
                      </div>
                    </div>
                    <div className="sm:text-right text-left sm:flex-none flex-[100]">
                      <div className="flex items-center sm:justify-end justify-normal gap-1 text-green-600 font-semibold">
                        <Wallet className="h-4 w-4" />
                        Rp {nasabah.saldo.toLocaleString()}
                      </div>
                      <Badge
                        variant={nasabah.saldo > 0 ? "default" : "secondary"}
                        className="mt-1"
                      >
                        {nasabah.saldo > 0 ? "Ada Saldo" : "Saldo Kosong"}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <MapPin className="h-3 w-3" />
                    {nasabah.alamat}
                  </div>
                  {/* 🆕 Toggle Status Button */}
                  <Button
                    size="sm"
                    variant={nasabah.isActive ? "outline" : "default"}
                    onClick={() => handleToggleStatus(nasabah)}
                    disabled={toggleLoading === nasabah.id}
                    className={
                      nasabah.isActive
                        ? "text-orange-600 hover:text-orange-700 hover:bg-orange-50 mt-2"
                        : "bg-green-600 hover:bg-green-700 text-white mt-2"
                    }
                    title={
                      nasabah.isActive
                        ? "Non-aktifkan nasabah"
                        : "Aktifkan nasabah"
                    }
                  >
                    {toggleLoading === nasabah.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : nasabah.isActive ? (
                      <>
                        <PowerOff className="h-4 w-4 mr-1" />
                        Non-aktifkan
                      </>
                    ) : (
                      <>
                        <Power className="h-4 w-4 mr-1" />
                        Aktifkan
                      </>
                    )}
                  </Button>

                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>
                        Bergabung:{" "}
                        {new Date(nasabah.createdAt).toLocaleDateString(
                          "id-ID",
                        )}
                      </span>
                      <span>
                        Update:{" "}
                        {new Date(nasabah.updatedAt).toLocaleDateString(
                          "id-ID",
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
