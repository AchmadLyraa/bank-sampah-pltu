import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Package,
  ArrowUpDown,
  Calendar,
  ShoppingCart, // 🆕 Icon untuk penjualan
  BarChart3, // 🆕 Icon untuk grafik
} from "lucide-react";
import { useEffect, useRef } from "react"; // 🆕 Untuk D3
import * as d3 from "d3"; // 🆕 Import D3
import { DateTime } from "luxon";

interface LaporanPendapatanProps {
  data: {
    totalPemasukan: number;
    totalPenjualan: number;
    totalPengeluaran: number;
    keuntungan: number;
    pemasukan: any[];
    penjualanSampah: any[];
    pengeluaran: any[];
    summaryByType: {
      jenisSampah: string;
      totalBerat: number;
      totalNilai: number;
      jumlahTransaksi: number;
    }[];
    // 🆕 TAMBAHAN: Summary penjualan
    penjualanSummaryByType: {
      jenisSampah: string;
      totalBerat: number;
      totalNilai: number;
      jumlahTransaksi: number;
    }[];
    filterInfo?: {
      startDate?: Date | null;
      endDate?: Date | null;
      totalTransaksi: number;
    };
  };
}

export default function LaporanPendapatan({ data }: LaporanPendapatanProps) {
  const chartRef = useRef<SVGSVGElement>(null); // 🆕 Ref untuk grafik

  const {
    totalPemasukan,
    totalPenjualan,
    totalPengeluaran,
    keuntungan,
    pemasukan,
    penjualanSampah,
    pengeluaran,
    summaryByType,
    penjualanSummaryByType, // 🆕 Destructure penjualan summary
    filterInfo,
  } = data;

  // 🆕 Buat grafik profit/loss seperti saham
  useEffect(() => {
    if (!chartRef.current) return;

    // Clear previous chart
    d3.select(chartRef.current).selectAll("*").remove();

    // Gabungkan semua transaksi dan urutkan berdasarkan waktu
    const allTransactions = [
      ...pemasukan.map((t) => ({
        date: new Date(t.createdAt),
        value: -t.totalNilai, // Negatif karena pengeluaran
        type: "pembelian",
        keterangan: t.nasabah?.person?.nama || "Pembelian",
      })),
      ...penjualanSampah.map((t) => ({
        date: new Date(t.createdAt),
        value: t.totalNilai, // Positif karena pemasukan
        type: "penjualan",
        keterangan: t.keterangan || "Penjualan",
      })),
      ...pengeluaran.map((t) => ({
        date: new Date(t.createdAt),
        value: -t.totalNilai, // Negatif karena pengeluaran
        type: "penarikan",
        keterangan: t.nasabah?.person?.nama || "Penarikan",
      })),
    ].sort((a, b) => a.date.getTime() - b.date.getTime());

    // Hitung cumulative profit/loss
    let cumulativeProfit = 0;
    const chartData = allTransactions.map((t) => {
      cumulativeProfit += t.value;
      return {
        ...t,
        cumulativeProfit,
      };
    });

    if (chartData.length === 0) {
      // Tampilkan pesan jika tidak ada data
      const svg = d3
        .select(chartRef.current)
        .attr("width", 500)
        .attr("height", 200);

      svg
        .append("text")
        .attr("x", 250)
        .attr("y", 100)
        .attr("text-anchor", "middle")
        .style("font-size", "14px")
        .style("fill", "#6b7280")
        .text("Tidak ada data transaksi untuk periode ini");

      return;
    }

    // Dimensi
    const margin = { top: 20, right: 30, bottom: 60, left: 80 };
    const width = 600 - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;

    // SVG setup
    const svg = d3.select(chartRef.current);
    // .attr("width", width + margin.left + margin.right)
    // .attr("height", height + margin.top + margin.bottom);

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Scales
    const xScale = d3
      .scaleTime()
      .range([0, width])
      .domain(d3.extent(chartData, (d) => d.date) as [Date, Date]);

    const yExtent = d3.extent(chartData, (d) => d.cumulativeProfit) as [
      number,
      number,
    ];
    const yScale = d3
      .scaleLinear()
      .range([height, 0])
      .domain([
        Math.min(yExtent[0], 0) * 1.1, // Extend domain untuk padding
        Math.max(yExtent[1], 0) * 1.1,
      ]);

    // Zero line
    g.append("line")
      .attr("x1", 0)
      .attr("x2", width)
      .attr("y1", yScale(0))
      .attr("y2", yScale(0))
      .style("stroke", "#6b7280")
      .style("stroke-dasharray", "3,3")
      .style("opacity", 0.7);

    // Line generator
    const line = d3
      .line<(typeof chartData)[0]>()
      .x((d) => xScale(d.date))
      .y((d) => yScale(d.cumulativeProfit))
      .curve(d3.curveMonotoneX);

    // Area generator untuk gradient
    const area = d3
      .area<(typeof chartData)[0]>()
      .x((d) => xScale(d.date))
      .y0(yScale(0))
      .y1((d) => yScale(d.cumulativeProfit))
      .curve(d3.curveMonotoneX);

    // Gradient definitions
    const defs = svg.append("defs");

    const gradientProfit = defs
      .append("linearGradient")
      .attr("id", "profit-gradient")
      .attr("gradientUnits", "userSpaceOnUse")
      .attr("x1", 0)
      .attr("y1", yScale(0))
      .attr("x2", 0)
      .attr("y2", 0);

    gradientProfit
      .append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "#16a34a")
      .attr("stop-opacity", 0.1);

    gradientProfit
      .append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#16a34a")
      .attr("stop-opacity", 0.4);

    const gradientLoss = defs
      .append("linearGradient")
      .attr("id", "loss-gradient")
      .attr("gradientUnits", "userSpaceOnUse")
      .attr("x1", 0)
      .attr("y1", yScale(0))
      .attr("x2", 0)
      .attr("y2", height);

    gradientLoss
      .append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "#dc2626")
      .attr("stop-opacity", 0.1);

    gradientLoss
      .append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#dc2626")
      .attr("stop-opacity", 0.4);

    // Area fill
    g.append("path")
      .datum(chartData)
      .attr(
        "fill",
        chartData[chartData.length - 1].cumulativeProfit >= 0
          ? "url(#profit-gradient)"
          : "url(#loss-gradient)",
      )
      .attr("d", area);

    // Line
    g.append("path")
      .datum(chartData)
      .attr("fill", "none")
      .attr(
        "stroke",
        chartData[chartData.length - 1].cumulativeProfit >= 0
          ? "#16a34a"
          : "#dc2626",
      )
      .attr("stroke-width", 2)
      .attr("d", line);

    // Dots untuk setiap transaksi
    g.selectAll(".dot")
      .data(chartData)
      .enter()
      .append("circle")
      .attr("class", "dot")
      .attr("cx", (d) => xScale(d.date))
      .attr("cy", (d) => yScale(d.cumulativeProfit))
      .attr("r", 3)
      .attr("fill", (d) => {
        if (d.type === "penjualan") return "#16a34a";
        if (d.type === "penarikan") return "#2563eb";
        return "#dc2626";
      })
      .style("opacity", 0.8);

    // X Axis
    g.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(
        d3
          .axisBottom(xScale)
          .tickFormat(d3.timeFormat("%d/%m"))
          .ticks(Math.min(chartData.length, 8)),
      )
      .style("font-size", "11px");

    // Y Axis
    g.append("g")
      .call(
        d3.axisLeft(yScale).tickFormat((d) => {
          const val = Number(d);
          return val >= 0
            ? `+Rp ${(val / 1000).toFixed(0)}K`
            : `-Rp ${Math.abs(val / 1000).toFixed(0)}K`;
        }),
      )
      .style("font-size", "11px");

    // Current value label
    const finalValue = chartData[chartData.length - 1].cumulativeProfit;
    g.append("text")
      .attr("x", width - 10)
      .attr("y", yScale(finalValue) - 10)
      .attr("text-anchor", "end")
      .style("font-size", "12px")
      .style("font-weight", "bold")
      .style("fill", finalValue >= 0 ? "#16a34a" : "#dc2626")
      .text(
        `${finalValue >= 0 ? "+" : ""}Rp ${(finalValue / 1000000).toFixed(2)}M`,
      );
  }, [pemasukan, penjualanSampah, pengeluaran]);

  // 📅 Format filter info
  const getFilterText = () => {
    if (!filterInfo?.startDate || !filterInfo?.endDate) {
      return "Semua Data";
    }

    const start = new Date(filterInfo.startDate).toLocaleDateString("id-ID");
    const end = new Date(filterInfo.endDate).toLocaleDateString("id-ID");

    if (start === end) {
      return `Tanggal: ${start}`;
    }

    return `Periode: ${start} - ${end}`;
  };

  return (
    <div className="space-y-6">
      {/* 🗓️ Filter Info Banner */}
      {filterInfo && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">
                  📊 {getFilterText()}
                </span>
              </div>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                {filterInfo.totalTransaksi} Transaksi
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pembelian dari Nasabah
            </CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              Rp {totalPemasukan.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Total pengeluaran untuk beli sampah
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Penjualan ke Pihak Ketiga
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              Rp {totalPenjualan.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Total pemasukan dari jual sampah
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Penarikan Nasabah
            </CardTitle>
            <ArrowUpDown className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              Rp {totalPengeluaran.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Total saldo yang ditarik nasabah
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Keuntungan Bersih
            </CardTitle>
            <DollarSign
              className={`h-4 w-4 ${keuntungan >= 0 ? "text-green-600" : "text-red-600"}`}
            />
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${keuntungan >= 0 ? "text-green-600" : "text-red-600"}`}
            >
              Rp {keuntungan.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Penjualan - Pembelian
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 🆕 GRAFIK D3.js */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-purple-600" />
            Grafik Keuntungan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center mx-0 lg:mx-24">
            <svg
              ref={chartRef}
              className="w-full h-auto"
              viewBox="0 0 600 300"
              preserveAspectRatio="xMinYMin meet"
            />
          </div>
          <div className="mt-4 flex justify-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-600 rounded-full"></div>
              <span>Pembelian</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-600 rounded-full"></div>
              <span>Penjualan</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
              <span>Penarikan Saldo</span>
            </div>
          </div>
          <div className="mt-2 text-center">
            <div
              className={`text-lg font-bold ${keuntungan >= 0 ? "text-green-600" : "text-red-600"}`}
            >
              Total: {keuntungan >= 0 ? "+" : ""}Rp{" "}
              {keuntungan.toLocaleString()}
            </div>
            <div className="text-xs text-gray-500">
              Grafik menunjukkan akumulasi keuntungan/kerugian dari waktu ke
              waktu
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 🔄 DUA TABEL: Pembelian dan Penjualan Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Summary Pembelian by Waste Type */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-red-600" />
              Ringkasan Pembelian
            </CardTitle>
          </CardHeader>
          <CardContent>
            {summaryByType.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Tidak ada data pembelian untuk periode yang dipilih</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-2">Jenis Sampah</th>
                      <th className="text-left py-2 px-2">Berat (kg)</th>
                      <th className="text-left py-2 px-2">Total Nilai</th>
                      <th className="text-left py-2 px-2">Transaksi</th>
                      <th className="text-left py-2 px-2">Rata/kg</th>
                    </tr>
                  </thead>
                  <tbody>
                    {summaryByType.map((item, index) => (
                      <tr key={index} className="border-b">
                        <td className="py-2 px-2 font-medium">
                          {item.jenisSampah}
                        </td>
                        <td className="py-2 px-2">
                          {item.totalBerat.toFixed(1)}
                        </td>
                        <td className="py-2 px-2 text-red-600 font-semibold text-nowrap">
                          Rp {item.totalNilai.toLocaleString()}
                        </td>
                        <td className="py-2 px-2">{item.jumlahTransaksi}</td>
                        <td className="py-2 px-2 text-nowrap">
                          Rp{" "}
                          {item.totalBerat > 0
                            ? Math.round(
                                item.totalNilai / item.totalBerat,
                              ).toLocaleString()
                            : 0}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 🆕 Summary Penjualan by Waste Type */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-green-600" />
              Ringkasan Penjualan
            </CardTitle>
          </CardHeader>
          <CardContent>
            {penjualanSummaryByType.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <ShoppingCart className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Tidak ada data penjualan untuk periode yang dipilih</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-2">Jenis Sampah</th>
                      <th className="text-left py-2 px-2">Berat (kg)</th>
                      <th className="text-left py-2 px-2">Total Nilai</th>
                      <th className="text-left py-2 px-2">Transaksi</th>
                      <th className="text-left py-2 px-2">Rata/kg</th>
                    </tr>
                  </thead>
                  <tbody>
                    {penjualanSummaryByType.map((item, index) => (
                      <tr key={index} className="border-b">
                        <td className="py-2 px-2 font-medium">
                          {item.jenisSampah}
                        </td>
                        <td className="py-2 px-2">
                          {item.totalBerat.toFixed(1)}
                        </td>
                        <td className="py-2 px-2 text-green-600 font-semibold text-nowrap">
                          Rp {item.totalNilai.toLocaleString()}
                        </td>
                        <td className="py-2 px-2">{item.jumlahTransaksi}</td>
                        <td className="py-2 px-2 text-nowrap">
                          Rp{" "}
                          {item.totalBerat > 0
                            ? Math.round(
                                item.totalNilai / item.totalBerat,
                              ).toLocaleString()
                            : 0}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Sales */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Penjualan Terbaru ({penjualanSampah.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {penjualanSampah.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  Tidak ada penjualan untuk periode ini
                </p>
              ) : (
                penjualanSampah.slice(0, 10).map((transaksi) => (
                  <div
                    key={transaksi.id}
                    className="flex justify-between items-center p-3 border rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-sm">
                        Penjualan ke Pihak Ketiga
                      </p>
                      <p className="text-xs text-gray-500">
                        {DateTime.fromJSDate(new Date(transaksi.createdAt))
                          .setZone(
                            Intl.DateTimeFormat().resolvedOptions().timeZone,
                          )
                          .toFormat("dd/MM/yyyy HH:mm")}
                      </p>
                      {transaksi.detailTransaksi &&
                        transaksi.detailTransaksi.length > 0 && (
                          <p className="text-xs text-gray-600">
                            {transaksi.detailTransaksi
                              .map(
                                (d: any) =>
                                  `${d.inventarisSampah.jenisSampah} (${d.beratKg}kg)`,
                              )
                              .join(", ")}
                          </p>
                        )}
                      {transaksi.keterangan && (
                        <p className="text-xs text-gray-600">
                          {transaksi.keterangan}
                        </p>
                      )}
                    </div>
                    <Badge
                      variant="default"
                      className="bg-green-100 text-green-800"
                    >
                      +Rp {transaksi.totalNilai.toLocaleString()}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Purchases */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-red-600" />
              Pembelian Terbaru ({pemasukan.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {pemasukan.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  Tidak ada pembelian untuk periode ini
                </p>
              ) : (
                pemasukan.slice(0, 10).map((transaksi) => (
                  <div
                    key={transaksi.id}
                    className="flex justify-between items-center p-3 border rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-sm">
                        {transaksi.nasabah?.person?.nama}
                      </p>
                      <p className="text-xs text-gray-500">
                        {DateTime.fromJSDate(new Date(transaksi.createdAt))
                          .setZone(
                            Intl.DateTimeFormat().resolvedOptions().timeZone,
                          )
                          .toFormat("dd/MM/yyyy HH:mm")}
                      </p>
                      {transaksi.detailTransaksi && (
                        <p className="text-xs text-gray-600">
                          {transaksi.detailTransaksi
                            .map(
                              (d: any) =>
                                `${d.inventarisSampah.jenisSampah} (${d.beratKg}kg)`,
                            )
                            .join(", ")}
                        </p>
                      )}
                    </div>
                    <Badge variant="destructive">
                      -Rp {transaksi.totalNilai.toLocaleString()}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* 🆕 Recent Withdrawals (Penarikan) */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowUpDown className="h-5 w-5 text-blue-600" />
              Penarikan Terbaru ({pengeluaran.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {pengeluaran.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  Tidak ada penarikan untuk periode ini
                </p>
              ) : (
                pengeluaran.slice(0, 10).map((transaksi) => (
                  <div
                    key={transaksi.id}
                    className="flex justify-between items-center p-3 border rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-sm">
                        {transaksi.nasabah?.person?.nama || "Nasabah"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {DateTime.fromJSDate(new Date(transaksi.createdAt))
                          .setZone(
                            Intl.DateTimeFormat().resolvedOptions().timeZone,
                          )
                          .toFormat("dd/MM/yyyy HH:mm")}
                      </p>
                      {transaksi.keterangan && (
                        <p className="text-xs text-gray-600">
                          {transaksi.keterangan}
                        </p>
                      )}
                    </div>
                    <Badge
                      variant="outline"
                      className="border-blue-500 text-blue-600"
                    >
                      -Rp {transaksi.totalNilai.toLocaleString()}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
