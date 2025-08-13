"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Plus, MapPin, Building2, Users, Eye, Search } from "lucide-react";
import { AddBankSampahDialog } from "./add-bank-sampah-dialog";
import { BankSampahDetailDialog } from "./bank-sampah-detail-dialog";
import {
  getBankSampahList,
  toggleBankSampahStatus,
} from "@/app/actions/controller";
import type { BankSampah } from "@/types";

export function BankSampahList() {
  const [bankSampahList, setBankSampahList] = useState<
    (BankSampah & { _count: { nasabah: number } })[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [selectedBankSampah, setSelectedBankSampah] = useState<{
    id: string;
    nama: string;
  } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchData = async () => {
    try {
      const result = await getBankSampahList();
      if (result.success) {
        setBankSampahList(result.data);
      }
    } catch (error) {
      console.error("Error fetching bank sampah list:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter bank sampah berdasarkan search query
  const filteredBankSampahList = useMemo(() => {
    if (!searchQuery.trim()) return bankSampahList;

    return bankSampahList.filter((bankSampah) =>
      bankSampah.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bankSampah.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bankSampah.alamat?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [bankSampahList, searchQuery]);

  const handleToggleStatus = async (id: string) => {
    await toggleBankSampahStatus(id);
    fetchData(); // refresh data after toggle
  };

  const handleAddSuccess = () => {
    setShowAddDialog(false);
    fetchData(); // refresh data after add
  };

  const handleShowDetail = (bankSampah: BankSampah) => {
    setSelectedBankSampah({ id: bankSampah.id, nama: bankSampah.nama });
    setShowDetailDialog(true);
  };

  if (loading) {
    return <div className="text-center">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold">Daftar Bank Sampah</h2>
          <p className="text-sm text-gray-600">
            Total: {bankSampahList.length} bank sampah
            {searchQuery && ` (${filteredBankSampahList.length} hasil pencarian)`}
          </p>
        </div>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Tambah Bank Sampah
        </Button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          type="text"
          placeholder="Cari bank sampah berdasarkan nama, email, atau alamat..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {filteredBankSampahList.length === 0 ? (
        <p className="text-center text-gray-500">
          {searchQuery
            ? `Tidak ada bank sampah yang cocok dengan pencarian "${searchQuery}"`
            : "Belum ada bank sampah terdaftar"
          }
        </p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredBankSampahList.map((bankSampah) => (
            <Card key={bankSampah.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-green-600" />
                    <CardTitle className="text-lg">{bankSampah.nama}</CardTitle>
                  </div>
                  <Badge
                    variant={bankSampah.isActive ? "default" : "secondary"}
                  >
                    {bankSampah.isActive ? "Aktif" : "Nonaktif"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm text-gray-600">
                  <p>
                    <strong>Email:</strong> {bankSampah.email}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <MapPin className="h-3 w-3" />
                    <span>
                      {bankSampah.latitude && bankSampah.longitude
                        ? `${bankSampah.latitude}, ${bankSampah.longitude}`
                        : "Lokasi belum diset"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    <Users className="h-3 w-3" />
                    <span>
                      {bankSampah._count?.nasabah || 0} nasabah terdaftar
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 bg-transparent"
                    onClick={() => handleShowDetail(bankSampah)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Detail
                  </Button>
                  <Button
                    variant={bankSampah.isActive ? "destructive" : "default"}
                    size="sm"
                    className="flex-1"
                    onClick={() => handleToggleStatus(bankSampah.id)}
                  >
                    {bankSampah.isActive ? "Nonaktifkan" : "Aktifkan"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AddBankSampahDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onSuccess={handleAddSuccess}
      />
      {selectedBankSampah && (
        <BankSampahDetailDialog
          open={showDetailDialog}
          onOpenChange={setShowDetailDialog}
          bankSampahId={selectedBankSampah.id}
          bankSampahName={selectedBankSampah.nama}
        />
      )}
    </div>
  );
}
