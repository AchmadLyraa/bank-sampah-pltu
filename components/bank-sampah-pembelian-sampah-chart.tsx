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
import { getBankSampahPembelianKg } from "@/app/actions/controller";

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

interface DataItem {
  date: string;
  jenis: string;
  beratKg: number;
}

interface Props {
  bankSampahId: string;
}

export function BankSampahPembelianChart({ bankSampahId }: Props) {
  const [data, setData] = useState<DataItem[]>([]);
  const [dateFilter, setDateFilter] = useState("30");
  const [loading, setLoading] = useState(true);

  const fetchData = async (filter: string) => {
    setLoading(true);
    try {
      const result = await getBankSampahPembelianKg(bankSampahId, filter);
      if (result.success) {
        setData(result.data || []);
      }
    } catch (error) {
      console.error("Error fetching pembelian data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(dateFilter);
  }, [bankSampahId, dateFilter]);

  // --- ambil semua tanggal unik
  const allLabels = Array.from(new Set(data.map((d) => d.date))).sort();

  // Fungsi sampling max 15 titik
  function sampleLabels(labels: string[], max: number) {
    if (labels.length <= max) return labels;
    const step = Math.ceil(labels.length / max);
    return labels.filter((_, idx) => idx % step === 0);
  }

  const labels = sampleLabels(allLabels, 15);

  // --- ambil semua jenis sampah unik
  const jenisList = Array.from(new Set(data.map((d) => d.jenis)));

  const colors = [
    "#3b82f6", // biru
    "#10b981", // hijau
    "#f59e0b", // kuning
    "#ef4444", // merah
    "#8b5cf6", // ungu
    "#06b6d4", // cyan
  ];

  // --- dataset per jenis
  const datasets = jenisList.map((jenis, idx) => ({
    label: jenis,
    data: allLabels.map((date) => {
      const found = data.find((d) => d.date === date && d.jenis === jenis);
      return found ? found.beratKg : 0;
    }),
    borderColor: colors[idx % colors.length],
    backgroundColor: "transparent",
    fill: false,
    tension: 0.4,
    pointRadius: 4,
    pointBackgroundColor: colors[idx % colors.length],
    pointBorderColor: "#fff",
    pointBorderWidth: 2,
  }));

  const chartData = {
    labels: allLabels.map((date) => {
      const d = new Date(date);
      return d.toLocaleDateString("id-ID", {
        month: "short",
        day: "numeric",
      });
    }),
    datasets,
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleColor: "#ffffff",
        bodyColor: "#ffffff",
        borderColor: "#3b82f6",
        borderWidth: 1,
        callbacks: {
          label: (context: any) =>
            `${context.dataset.label}: ${context.parsed.y.toLocaleString(
              "id-ID",
            )} kg`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          color: "#6b7280",
          maxTicksLimit: 15, // ⬅️ batasin label jadi maksimal 15
        },
      },
      y: {
        grid: { color: "rgba(0,0,0,0.1)" },
        ticks: {
          color: "#6b7280",
          callback: (val: any) => `${val} kg`,
        },
      },
    },
    interaction: { intersect: false, mode: "index" as const },
  };

  // --- total per jenis sampah
  const totalPerJenis = jenisList.map((jenis) => {
    const total = data
      .filter((d) => d.jenis === jenis)
      .reduce((sum, d) => sum + d.beratKg, 0);
    return { jenis, total };
  });

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold leading-none tracking-tight mt-8">
        Grafik Pembelian Sampah
      </h2>
      {/* Filter */}
      <div className="flex flex-wrap gap-2">
        {["1", "7", "14", "30", "all"].map((f) => (
          <Button
            key={f}
            variant={dateFilter === f ? "default" : "outline"}
            size="sm"
            onClick={() => setDateFilter(f)}
          >
            {f === "1"
              ? "Hari Ini"
              : f === "7"
                ? "7 Hari"
                : f === "14"
                  ? "14 Hari"
                  : f === "30"
                    ? "30 Hari"
                    : "Semua Data"}
          </Button>
        ))}
      </div>

      {/* Summary per jenis */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {totalPerJenis.map((item, idx) => (
          <div
            key={item.jenis}
            className="p-4 rounded-lg"
            style={{
              backgroundColor: `${colors[idx % colors.length]}20`,
            }}
          >
            <p
              className="text-sm font-medium"
              style={{ color: colors[idx % colors.length] }}
            >
              {item.jenis}
            </p>
            <p
              className="text-lg font-bold"
              style={{ color: colors[idx % colors.length] }}
            >
              {item.total.toLocaleString("id-ID")} kg
            </p>
          </div>
        ))}
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
