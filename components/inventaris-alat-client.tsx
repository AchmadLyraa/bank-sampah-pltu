"use client";
import { useState, useEffect } from "react";
import { getInventarisAlat } from "@/app/actions/inventaris-management";
import LayoutWrapper from "@/components/layout-wrapper";
import InventarisAlatForm from "@/components/inventaris-alat-form";
import InventarisAlatTable from "@/components/inventaris-alat-table";

interface InventarisPageClientProps {
  bankSampahId: string;
  userName: string;
}

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

export default function InventarisPageClient({
  bankSampahId,
  userName,
}: InventarisPageClientProps) {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [statsData, setStatsData] = useState<InventarisAlat[]>([]);
  const [loading, setLoading] = useState(true);

  // Function to trigger refresh dari form ke table
  const handleDataChange = () => {
    setRefreshTrigger((prev) => prev + 1);
    loadStatsData(); // 🔥 Refresh stats data juga!
  };

  // Load stats data
  const loadStatsData = async () => {
    try {
      setLoading(true);
      const data = await getInventarisAlat(bankSampahId);
      setStatsData(data);
    } catch (error) {
      console.error("Error loading stats:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStatsData();
  }, [bankSampahId, refreshTrigger]);

  // 📊 Calculate stats
  const totalAlat = statsData.length;
  const totalNilai = statsData.reduce((sum, item) => sum + item.hargaBeli, 0);
  const kondisiBaik = statsData.filter(
    (item) =>
      item.kondisi.toLowerCase().includes("baik") || item.kondisi === "Baik",
  ).length;

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Inventaris Alat</h1>
          <p className="text-sm text-gray-600 mt-1">
            Kelola inventaris alat dan peralatan bank sampah
          </p>
        </div>
        <InventarisAlatForm onSuccess={handleDataChange} />
      </div>

      {/* 🔥 Stats Cards - REAL DATA! */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-gray-600">
                Total Alat
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {loading ? "..." : totalAlat.toLocaleString()}
              </div>
            </div>
            <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
              <svg
                className="h-6 w-6 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-gray-600">
                Total Nilai
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {loading ? "..." : `Rp ${totalNilai.toLocaleString("id-ID")}`}
              </div>
            </div>
            <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
              <svg
                className="h-6 w-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-gray-600">
                Kondisi Baik
              </div>
              <div className="text-2xl font-bold text-green-600">
                {loading ? "..." : `${kondisiBaik}/${totalAlat}`}
              </div>
            </div>
            <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
              <svg
                className="h-6 w-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-lg shadow-sm">
        <InventarisAlatTable
          bankSampahId={bankSampahId}
          refreshTrigger={refreshTrigger}
          onDataChange={handleDataChange}
        />
      </div>
    </div>
  );
}
