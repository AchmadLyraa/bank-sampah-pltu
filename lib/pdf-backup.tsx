import type React from "react"
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer"

// 🎨 PDF Styles
const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#ffffff",
    padding: 20,
    fontSize: 10,
  },
  header: {
    textAlign: "center",
    marginBottom: 20,
    borderBottom: "2px solid #333333",
    paddingBottom: 15,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2563eb",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 3,
  },
  text: {
    fontSize: 9,
    color: "#666666",
    marginBottom: 2,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    backgroundColor: "#f3f4f6",
    padding: 8,
    marginBottom: 10,
    borderLeft: "4px solid #2563eb",
  },
  summaryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 15,
  },
  summaryCard: {
    width: "23%",
    margin: "1%",
    border: "1px solid #e5e7eb",
    padding: 10,
    backgroundColor: "#f9fafb",
  },
  summaryLabel: {
    fontSize: 8,
    color: "#374151",
    marginBottom: 3,
  },
  summaryValue: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#059669",
  },
  table: {
    display: "table",
    width: "100%",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#d1d5db",
    marginBottom: 10,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#d1d5db",
    borderBottomStyle: "solid",
    minHeight: 20,
    alignItems: "center",
  },
  tableHeader: {
    backgroundColor: "#f3f4f6",
    fontWeight: "bold",
    fontSize: 8,
  },
  tableCell: {
    padding: 4,
    fontSize: 7,
    borderRightWidth: 1,
    borderRightColor: "#d1d5db",
    borderRightStyle: "solid",
  },
  footer: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    textAlign: "center",
    fontSize: 8,
    color: "#6b7280",
    borderTop: "1px solid #e5e7eb",
    paddingTop: 10,
  },
})

interface BackupPDFProps {
  data: {
    bankSampah: any
    nasabahList: any[]
    inventarisList: any[]
    summary: any
    generatedAt: Date
  }
}

export const BackupPDF: React.FC<BackupPDFProps> = ({ data }) => {
  const { bankSampah, nasabahList, inventarisList, summary, generatedAt } = data

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* 📋 Header */}
        <View style={styles.header}>
          <Text style={styles.title}>📊 LAPORAN BACKUP DATA</Text>
          <Text style={styles.subtitle}>{bankSampah?.nama || "Bank Sampah"}</Text>
          <Text style={styles.text}>📍 {bankSampah?.alamat}</Text>
          <Text style={styles.text}>
            📞 {bankSampah?.telepon} | ✉️ {bankSampah?.email}
          </Text>
          <Text style={styles.text}>Tanggal Generate: {new Date(generatedAt).toLocaleString("id-ID")}</Text>
        </View>

        {/* 📊 Summary Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📈 RINGKASAN DATA</Text>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>👥 Total Nasabah</Text>
              <Text style={styles.summaryValue}>{summary.totalNasabah}</Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>💰 Total Saldo</Text>
              <Text style={styles.summaryValue}>Rp {summary.totalSaldo.toLocaleString()}</Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>📦 Total Stok</Text>
              <Text style={styles.summaryValue}>{summary.totalStok.toFixed(1)} kg</Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>💎 Nilai Inventaris</Text>
              <Text style={styles.summaryValue}>Rp {summary.totalNilaiInventaris.toLocaleString()}</Text>
            </View>
          </View>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>📈 Total Pembelian</Text>
              <Text style={styles.summaryValue}>Rp {summary.totalPemasukan.toLocaleString()}</Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>📊 Total Penjualan</Text>
              <Text style={styles.summaryValue}>Rp {summary.totalPenjualan.toLocaleString()}</Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>💸 Total Penarikan</Text>
              <Text style={styles.summaryValue}>Rp {summary.totalPengeluaran.toLocaleString()}</Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>🎯 Keuntungan</Text>
              <Text style={[styles.summaryValue, { color: summary.keuntungan >= 0 ? "#059669" : "#dc2626" }]}>
                Rp {summary.keuntungan.toLocaleString()}
              </Text>
            </View>
          </View>
        </View>

        {/* 👥 Nasabah Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>👥 DATA NASABAH ({nasabahList.length})</Text>
          <View style={styles.table}>
            {/* Table Header */}
            <View style={[styles.tableRow, styles.tableHeader]}>
              <Text style={[styles.tableCell, { width: "5%" }]}>No</Text>
              <Text style={[styles.tableCell, { width: "25%" }]}>Nama</Text>
              <Text style={[styles.tableCell, { width: "20%" }]}>Email</Text>
              <Text style={[styles.tableCell, { width: "15%" }]}>Telepon</Text>
              <Text style={[styles.tableCell, { width: "20%" }]}>Saldo</Text>
              <Text style={[styles.tableCell, { width: "15%" }]}>Tgl Daftar</Text>
            </View>

            {/* Table Rows */}
            {nasabahList.slice(0, 15).map((nasabah: any, index: number) => (
              <View key={index} style={styles.tableRow}>
                <Text style={[styles.tableCell, { width: "5%" }]}>{index + 1}</Text>
                <Text style={[styles.tableCell, { width: "25%" }]}>{nasabah.nama}</Text>
                <Text style={[styles.tableCell, { width: "20%" }]}>{nasabah.email}</Text>
                <Text style={[styles.tableCell, { width: "15%" }]}>{nasabah.telepon}</Text>
                <Text style={[styles.tableCell, { width: "20%" }]}>Rp {nasabah.saldo.toLocaleString()}</Text>
                <Text style={[styles.tableCell, { width: "15%" }]}>
                  {new Date(nasabah.createdAt).toLocaleDateString("id-ID")}
                </Text>
              </View>
            ))}

            {/* Total Row */}
            <View style={[styles.tableRow, { backgroundColor: "#f3f4f6", fontWeight: "bold" }]}>
              <Text style={[styles.tableCell, { width: "65%" }]}>TOTAL SALDO:</Text>
              <Text style={[styles.tableCell, { width: "20%" }]}>Rp {summary.totalSaldo.toLocaleString()}</Text>
              <Text style={[styles.tableCell, { width: "15%" }]}></Text>
            </View>
          </View>
        </View>
      </Page>

      {/* 📦 Page 2 - Inventaris */}
      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📦 DATA INVENTARIS SAMPAH ({inventarisList.length})</Text>
          <View style={styles.table}>
            {/* Table Header */}
            <View style={[styles.tableRow, styles.tableHeader]}>
              <Text style={[styles.tableCell, { width: "5%" }]}>No</Text>
              <Text style={[styles.tableCell, { width: "30%" }]}>Jenis Sampah</Text>
              <Text style={[styles.tableCell, { width: "10%" }]}>Status</Text>
              <Text style={[styles.tableCell, { width: "15%" }]}>Harga/kg</Text>
              <Text style={[styles.tableCell, { width: "15%" }]}>Stok (kg)</Text>
              <Text style={[styles.tableCell, { width: "15%" }]}>Total Nilai</Text>
              <Text style={[styles.tableCell, { width: "10%" }]}>Tgl Buat</Text>
            </View>

            {/* Table Rows */}
            {inventarisList.map((item: any, index: number) => (
              <View key={index} style={styles.tableRow}>
                <Text style={[styles.tableCell, { width: "5%" }]}>{index + 1}</Text>
                <Text style={[styles.tableCell, { width: "30%" }]}>{item.jenisSampah}</Text>
                <Text style={[styles.tableCell, { width: "10%", color: item.isActive ? "#059669" : "#dc2626" }]}>
                  {item.isActive ? "Aktif" : "Non-aktif"}
                </Text>
                <Text style={[styles.tableCell, { width: "15%" }]}>Rp {item.hargaPerKg.toLocaleString()}</Text>
                <Text style={[styles.tableCell, { width: "15%" }]}>{item.stokKg.toFixed(1)}</Text>
                <Text style={[styles.tableCell, { width: "15%" }]}>
                  Rp {(item.stokKg * item.hargaPerKg).toLocaleString()}
                </Text>
                <Text style={[styles.tableCell, { width: "10%" }]}>
                  {new Date(item.createdAt).toLocaleDateString("id-ID")}
                </Text>
              </View>
            ))}

            {/* Total Row */}
            <View style={[styles.tableRow, { backgroundColor: "#f3f4f6", fontWeight: "bold" }]}>
              <Text style={[styles.tableCell, { width: "60%" }]}>TOTAL:</Text>
              <Text style={[styles.tableCell, { width: "15%" }]}>{summary.totalStok.toFixed(1)} kg</Text>
              <Text style={[styles.tableCell, { width: "15%" }]}>
                Rp {summary.totalNilaiInventaris.toLocaleString()}
              </Text>
              <Text style={[styles.tableCell, { width: "10%" }]}></Text>
            </View>
          </View>
        </View>

        {/* 📄 Footer */}
        <View style={styles.footer}>
          <Text>📄 Laporan ini dibuat secara otomatis oleh sistem Bank Sampah</Text>
          <Text>🔒 Data ini bersifat rahasia dan hanya untuk keperluan backup internal</Text>
          <Text>⏰ Generated pada: {new Date(generatedAt).toLocaleString("id-ID")}</Text>
        </View>
      </Page>
    </Document>
  )
}
