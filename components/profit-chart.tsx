"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getBankSampahProfitData } from "@/app/actions/controller";
import DateFilter from "@/components/date-filter";
import { Loader2, TrendingUp, TrendingDown } from "lucide-react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  type ChartOptions,
} from "chart.js";
import { Bar } from "react-chartjs-2";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

interface ProfitChartProps {
  initialData: Awaited<ReturnType<typeof getBankSampahProfitData>>;
}

export function ProfitChart({ initialData }: ProfitChartProps) {
  const [profitData, setProfitData] = useState(initialData);
  const [filterLoading, setFilterLoading] = useState(false);

  const loadProfitData = async (
    startDate: Date | null,
    endDate: Date | null,
  ) => {
    setFilterLoading(true);
    try {
      const data = await getBankSampahProfitData(
        startDate || undefined,
        endDate || undefined,
      );
      setProfitData(data);
    } catch (error) {
      console.error("Error loading profit data:", error);
    } finally {
      setFilterLoading(false);
    }
  };

  const handleFilterChange = (startDate: Date | null, endDate: Date | null) => {
    loadProfitData(startDate, endDate);
  };

  if (!profitData.success || !profitData.data) {
    return (
      <div className="text-center py-12 text-red-500">
        <p>Error loading profit data: {profitData.error}</p>
      </div>
    );
  }

  const data = profitData.data;

  // Prepare chart data
  const chartData = {
    labels: data.map((item) => item.nama),
    datasets: [
      {
        label: "Keuntungan (Rp)",
        data: data.map((item) => item.keuntungan),
        backgroundColor: data.map((item) =>
          item.keuntungan >= 0
            ? "rgba(34, 197, 94, 0.8)"
            : "rgba(239, 68, 68, 0.8)",
        ),
        borderColor: data.map((item) =>
          item.keuntungan >= 0
            ? "rgba(34, 197, 94, 1)"
            : "rgba(239, 68, 68, 1)",
        ),
        borderWidth: 1,
      },
    ],
  };

  const options: ChartOptions<"bar"> = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "Grafik Keuntungan Bank Sampah",
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const value = context.parsed.y;
            return `Keuntungan: Rp ${value.toLocaleString("id-ID")}`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) => "Rp " + Number(value).toLocaleString("id-ID"),
        },
      },
    },
  };

  // Calculate totals
  const totalKeuntungan = data.reduce((sum, item) => sum + item.keuntungan, 0);
  const profitableBanks = data.filter((item) => item.keuntungan > 0).length;
  const lossBanks = data.filter((item) => item.keuntungan < 0).length;

  return (
    <div className="space-y-6">
      {/* Date Filter */}
      <DateFilter onFilterChange={handleFilterChange} loading={filterLoading} />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Keuntungan</p>
                <p
                  className={`text-2xl font-bold ${totalKeuntungan >= 0 ? "text-green-600" : "text-red-600"}`}
                >
                  Rp {totalKeuntungan.toLocaleString("id-ID")}
                </p>
              </div>
              {totalKeuntungan >= 0 ? (
                <TrendingUp className="h-8 w-8 text-green-600" />
              ) : (
                <TrendingDown className="h-8 w-8 text-red-600" />
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Bank Sampah Untung</p>
                <p className="text-2xl font-bold text-green-600">
                  {profitableBanks}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Bank Sampah Rugi</p>
                <p className="text-2xl font-bold text-red-600">{lossBanks}</p>
              </div>
              <TrendingDown className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Grafik Keuntungan per Bank Sampah</CardTitle>
        </CardHeader>
        <CardContent>
          {filterLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="ml-2">Memuat data grafik...</span>
            </div>
          ) : (
            <div className="h-96">
              <Bar data={chartData} options={options} />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>Detail Keuntungan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Bank Sampah</th>
                  <th className="text-right p-2">Pemasukan</th>
                  <th className="text-right p-2">Penjualan</th>
                  <th className="text-right p-2">Keuntungan</th>
                  <th className="text-center p-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {data.map((item) => (
                  <tr key={item.bankSampahId} className="border-b">
                    <td className="p-2 font-medium">{item.nama}</td>
                    <td className="p-2 text-right">
                      Rp {item.totalPemasukan.toLocaleString("id-ID")}
                    </td>
                    <td className="p-2 text-right">
                      Rp {item.totalPenjualan.toLocaleString("id-ID")}
                    </td>
                    <td
                      className={`p-2 text-right font-bold ${item.keuntungan >= 0 ? "text-green-600" : "text-red-600"}`}
                    >
                      Rp {item.keuntungan.toLocaleString("id-ID")}
                    </td>
                    <td className="p-2 text-center">
                      {item.keuntungan >= 0 ? (
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                          Untung
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">
                          Rugi
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
