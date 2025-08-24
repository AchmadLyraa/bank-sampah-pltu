"use client";
import { useEffect, useState } from "react";
import {
  getInventarisAlat,
  deleteInventarisAlat,
} from "@/app/actions/inventaris-management";
import { Button } from "@/components/ui/button";
import InventarisAlatForm from "./inventaris-alat-form";
import { Trash2 } from "lucide-react";

interface InventarisAlat {
  id: string;
  nama: string;
  jenis: string;
  merk?: string;
  kondisi: string;
  hargaBeli: number;
  metodePerolehan: string;
  createdAt: Date;
  updatedAt: Date;
}

interface InventarisAlatTableProps {
  bankSampahId: string;
  refreshTrigger: number;
  onDataChange: () => void;
}

export default function InventarisAlatTable({
  bankSampahId,
  refreshTrigger,
  onDataChange,
}: InventarisAlatTableProps) {
  const [alat, setAlat] = useState<InventarisAlat[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadData() {
    try {
      setLoading(true);
      const data = await getInventarisAlat(bankSampahId);
      setAlat(data);
    } catch (error) {
      console.error("Error loading inventaris data:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [bankSampahId, refreshTrigger]); // 🔥 Trigger refresh ketika refreshTrigger berubah!

  async function handleDelete(id: string) {
    if (!confirm("Apakah Anda yakin ingin menghapus alat ini?")) {
      return;
    }

    try {
      await deleteInventarisAlat(id);
      setAlat(alat.filter((item) => item.id !== id));
      onDataChange(); // 🔥 Trigger refresh untuk update stats juga!
    } catch (error) {
      console.error("Error deleting inventaris:", error);
    }
  }

  function handleSuccess() {
    // Refresh data after successful add/edit
    loadData();
    onDataChange(); // 🔥 Trigger parent refresh untuk sync stats!
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-sm text-muted-foreground">
          Loading inventaris...
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-md border">
      <table className="w-full text-sm">
        <thead className="bg-muted">
          <tr>
            <th className="p-2 text-center w-12">No</th>
            <th className="p-2 text-left w-32">Nama</th> {/* 🔧 Shortened */}
            <th className="p-2 text-left w-28">Jenis</th> {/* 🔧 Shortened */}
            <th className="p-2 text-left w-24">Merk</th> {/* 🔧 Shortened */}
            <th className="p-2 text-left w-28">Kondisi</th>
            <th className="p-2 text-left w-40">Harga Beli</th> {/* 🔥 WIDER! */}
            <th className="p-2 text-left w-32">Metode Perolehan</th>
            <th className="p-2 text-left w-24">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {alat.length === 0 ? (
            <tr>
              <td colSpan={8} className="p-6 text-center text-muted-foreground">
                Belum ada data inventaris alat
              </td>
            </tr>
          ) : (
            alat.map((item, i) => (
              <tr key={item.id} className="border-t hover:bg-muted/50">
                <td className="p-2 w-12 text-center">{i + 1}</td>
                <td className="p-2 w-32 font-medium truncate" title={item.nama}>
                  {" "}
                  {/* 🔧 Truncate + tooltip */}
                  {item.nama}
                </td>
                <td className="p-2 w-28 truncate" title={item.jenis}>
                  {" "}
                  {/* 🔧 Truncate + tooltip */}
                  {item.jenis}
                </td>
                <td className="p-2 w-24 truncate" title={item.merk || "-"}>
                  {" "}
                  {/* 🔧 Truncate + tooltip */}
                  {item.merk || "-"}
                </td>
                <td className="p-2 w-28">
                  <span
                    className={`px-2 py-1 rounded-full text-xs whitespace-nowrap ${
                      item.kondisi.toLowerCase() === "baik"
                        ? "bg-green-100 text-green-800"
                        : item.kondisi.toLowerCase() === "rusak"
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {item.kondisi}
                  </span>
                </td>
                <td className="p-2 w-40 text-left whitespace-nowrap">
                  {" "}
                  {/* 🔥 WIDER + right align */}
                  Rp {item.hargaBeli.toLocaleString("id-ID")}
                </td>
                <td className="p-2 w-32 truncate" title={item.metodePerolehan}>
                  {" "}
                  {/* 🔧 Truncate + tooltip */}
                  {item.metodePerolehan}
                </td>
                <td className="p-2 w-24">
                  <div className="flex items-center gap-2">
                    <InventarisAlatForm
                      editId={item.id}
                      onSuccess={handleSuccess}
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
