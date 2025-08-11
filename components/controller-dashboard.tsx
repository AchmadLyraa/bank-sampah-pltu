"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, MapPin, Phone, Mail, Building2 } from "lucide-react";
import type { BankSampah } from "@/types";
import { getBankSampahList } from "@/app/actions/controller";
import { AddBankSampahDialog } from "@/components/add-bank-sampah-dialog";

export function ControllerDashboard() {
  const [bankSampahList, setBankSampahList] = useState<BankSampah[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);

  useEffect(() => {
    loadBankSampahList();
  }, []);

  const loadBankSampahList = async () => {
    try {
      const result = await getBankSampahList();
      if (result.success) {
        setBankSampahList(result.data || []);
      }
    } catch (error) {
      console.error("Error loading bank sampah list:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSuccess = () => {
    setShowAddDialog(false);
    loadBankSampahList();
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-green-700">
            Controller Dashboard
          </h1>
          <p className="text-gray-600">Kelola bank sampah yang terdaftar</p>
        </div>
        <Button
          onClick={() => setShowAddDialog(true)}
          className="bg-green-600 hover:bg-green-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Tambah Bank Sampah
        </Button>
      </div>

      <div className="grid gap-4">
        {bankSampahList.map((bankSampah) => (
          <Card key={bankSampah.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="w-5 h-5" />
                    {bankSampah.nama}
                  </CardTitle>
                  <CardDescription>{bankSampah.alamat}</CardDescription>
                </div>
                <Badge variant={bankSampah.isActive ? "default" : "secondary"}>
                  {bankSampah.isActive ? "Aktif" : "Tidak Aktif"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-500" />
                  <span>{bankSampah.telepon}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <span>{bankSampah.email}</span>
                </div>
                {bankSampah.latitude && bankSampah.longitude && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <span>
                      {bankSampah.latitude}, {bankSampah.longitude}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {bankSampahList.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">
              Belum ada bank sampah yang terdaftar
            </p>
          </CardContent>
        </Card>
      )}

      <AddBankSampahDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onSuccess={handleAddSuccess}
      />
    </div>
  );
}
