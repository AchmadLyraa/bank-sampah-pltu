"use client";

import { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Button } from "@/components/ui/button";
import { getBankSampahIndividualProfit } from "@/app/actions/controller";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
);

interface ProfitData {
  date: string;
  profit: number;
}

interface BankSampahProfitChartProps {
  bankSampahId: string;
}

export function BankSampahProfitChart({
  bankSampahId,
}: BankSampahProfitChartProps) {
  const [profitData, setProfitData] = useState<ProfitData[]>([]);
  const [dateFilter, setDateFilter] = useState("30");
  const [loading, setLoading] = useState(true);

  const fetchProfitData = async (filter: string) => {
    setLoading(true);
    try {
      const result = await getBankSampahIndividualProfit(bankSampahId, filter);
      if (result.success) {
        setProfitData(result.data || []);
      }
    } catch (error) {
      console.error("Error fetching profit data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfitData(dateFilter);
  }, [bankSampahId, dateFilter]);

  const chartData = {
    labels: profitData.map((item) => {
      const date = new Date(item.date);
      return date.toLocaleDateString("id-ID", {
        month: "short",
        day: "numeric",
      });
    }),
    datasets: [
      {
        label: "Keuntungan (Rp)",
        data: profitData.map((item) => item.profit),
        borderColor: "#10b981",
        backgroundColor: "rgba(16, 185, 129, 0.1)",
        fill: true,
        tension: 0.4,
        pointBackgroundColor: "#10b981",
        pointBorderColor: "#ffffff",
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleColor: "#ffffff",
        bodyColor: "#ffffff",
        borderColor: "#10b981",
        borderWidth: 1,
        callbacks: {
          label: (context: any) =>
            `Keuntungan: Rp ${context.parsed.y.toLocaleString("id-ID")}`,
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: "#6b7280",
        },
      },
      y: {
        grid: {
          color: "rgba(0, 0, 0, 0.1)",
        },
        ticks: {
          color: "#6b7280",
          callback: (value: any) => `Rp ${value.toLocaleString("id-ID")}`,
        },
      },
    },
    interaction: {
      intersect: false,
      mode: "index" as const,
    },
  };

  const dateFilterOptions = [
    { value: "1", label: "Hari Ini" },
    { value: "7", label: "7 Hari" },
    { value: "14", label: "14 Hari" },
    { value: "30", label: "30 Hari" },
    { value: "all", label: "Semua Data" },
  ];

  const totalProfit = profitData.reduce((sum, item) => sum + item.profit, 0);
  const avgProfit = profitData.length > 0 ? totalProfit / profitData.length : 0;
  const maxProfit = Math.max(...profitData.map((item) => item.profit), 0);
  const minProfit = Math.min(...profitData.map((item) => item.profit), 0);

  return (
    <div className="space-y-6">
      {/* Date Filter */}
      <div className="flex flex-wrap gap-2">
        {dateFilterOptions.map((option) => (
          <Button
            key={option.value}
            variant={dateFilter === option.value ? "default" : "outline"}
            size="sm"
            onClick={() => setDateFilter(option.value)}
          >
            {option.label}
          </Button>
        ))}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-green-50 p-4 rounded-lg">
          <p className="text-sm text-green-600 font-medium">
            Total Keuntungan Sekarang
          </p>
          <p className="text-lg font-bold text-green-700">
            Rp {totalProfit.toLocaleString("id-ID")}
          </p>
        </div>
        {/*<div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm text-blue-600 font-medium">Rata-rata Harian</p>
          <p className="text-lg font-bold text-blue-700">
            Rp {avgProfit.toLocaleString("id-ID")}
          </p>
        </div>*/}
        <div className="bg-purple-50 p-4 rounded-lg">
          <p className="text-sm text-purple-600 font-medium">Tertinggi</p>
          <p className="text-lg font-bold text-purple-700">
            Rp {maxProfit.toLocaleString("id-ID")}
          </p>
        </div>
        <div className="bg-orange-50 p-4 rounded-lg">
          <p className="text-sm text-orange-600 font-medium">Terendah</p>
          <p className="text-lg font-bold text-orange-700">
            Rp {minProfit.toLocaleString("id-ID")}
          </p>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white p-6 rounded-lg border">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-gray-500">Loading chart...</div>
          </div>
        ) : (
          <div className="h-64">
            <Line data={chartData} options={chartOptions} />
          </div>
        )}
      </div>
    </div>
  );
}
