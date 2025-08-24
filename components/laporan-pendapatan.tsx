import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Package,
  ArrowUpDown,
  Calendar,
  ShoppingCart,
  BarChart3,
} from "lucide-react";
import { useEffect, useRef } from "react";
import * as d3 from "d3";
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
  const chartRef = useRef<SVGSVGElement>(null);

  const {
    totalPemasukan,
    totalPenjualan,
    totalPengeluaran,
    keuntungan,
    pemasukan,
    penjualanSampah,
    pengeluaran,
    summaryByType,
    penjualanSummaryByType,
    filterInfo,
  } = data;

  // Helper function untuk format rupiah dinamis
  const formatRupiah = (value: number) => {
    const absValue = Math.abs(value);

    if (absValue >= 1000000000) {
      // Milyar
      return `${value >= 0 ? "+" : "-"}Rp ${(absValue / 1000000000).toFixed(1)}B`;
    } else if (absValue >= 1000000) {
      // Juta
      return `${value >= 0 ? "+" : "-"}Rp ${(absValue / 1000000).toFixed(1)}M`;
    } else if (absValue >= 1000) {
      // Ribu
      return `${value >= 0 ? "+" : "-"}Rp ${(absValue / 1000).toFixed(0)}K`;
    } else {
      // Satuan
      return `${value >= 0 ? "+" : ""}Rp ${value.toLocaleString("id-ID")}`;
    }
  };

  useEffect(() => {
    if (!chartRef.current) return;

    d3.select(chartRef.current).selectAll("*").remove();

    const allTransactions = [
      ...pemasukan.map((t) => ({
        date: new Date(t.createdAt),
        value: -t.totalNilai,
        type: "pembelian",
        keterangan: t.nasabah?.person?.nama || "Pembelian",
      })),
      ...penjualanSampah.map((t) => ({
        date: new Date(t.createdAt),
        value: t.totalNilai,
        type: "penjualan",
        keterangan: t.keterangan || "Penjualan",
      })),
      ...pengeluaran.map((t) => ({
        date: new Date(t.createdAt),
        value: -t.totalNilai,
        type: "penarikan",
        keterangan: t.nasabah?.person?.nama || "Penarikan",
      })),
    ].sort((a, b) => a.date.getTime() - b.date.getTime());

    let cumulativeProfit = 0;
    const chartData = allTransactions.map((t) => {
      cumulativeProfit += t.value;
      return {
        ...t,
        cumulativeProfit,
      };
    });

    if (chartData.length === 0) {
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

    const margin = { top: 20, right: 30, bottom: 60, left: 80 };
    const width = 600 - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;

    const svg = d3.select(chartRef.current);

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

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
        Math.min(yExtent[0], 0) * 1.1,
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

    const line = d3
      .line<(typeof chartData)[0]>()
      .x((d) => xScale(d.date))
      .y((d) => yScale(d.cumulativeProfit))
      .curve(d3.curveMonotoneX);

    const area = d3
      .area<(typeof chartData)[0]>()
      .x((d) => xScale(d.date))
      .y0(yScale(0))
      .y1((d) => yScale(d.cumulativeProfit))
      .curve(d3.curveMonotoneX);

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

    // Dots
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

    // Y Axis dengan format dinamis
    g.append("g")
      .call(
        d3.axisLeft(yScale).tickFormat((d) => {
          return formatRupiah(Number(d));
        }),
      )
      .style("font-size", "11px");

    // Current value label dengan format dinamis
    const finalValue = chartData[chartData.length - 1].cumulativeProfit;
    g.append("text")
      .attr("x", width - 10)
      .attr("y", yScale(finalValue) - 10)
      .attr("text-anchor", "end")
      .style("font-size", "12px")
      .style("font-weight", "bold")
      .style("fill", finalValue >= 0 ? "#16a34a" : "#dc2626")
      .text(formatRupiah(finalValue));
  }, [pemasukan, penjualanSampah, pengeluaran]);

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
      {/* Filter Info Banner */}
      {filterInfo && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">
                  {getFilterText()}
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

      {/* Grafik D3.js */}
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
              Total: {formatRupiah(keuntungan)}
            </div>
            <div className="text-xs text-gray-500">
              Grafik menunjukkan akumulasi keuntungan/kerugian dari waktu ke waktu
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
