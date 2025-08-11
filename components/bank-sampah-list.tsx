"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, MapPin, Building2, Users, Eye } from "lucide-react";
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
          </p>
        </div>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Tambah Bank Sampah
        </Button>
      </div>

      {bankSampahList.length === 0 ? (
        <p className="text-center text-gray-500">
          Belum ada bank sampah terdaftar
        </p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {bankSampahList.map((bankSampah) => (
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
