import jsPDF from "jspdf"
import "jspdf-autotable"

// Extend jsPDF type to include autoTable
declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: any) => jsPDF
  }
}

export async function generateBackupPDF(data: any): Promise<Buffer> {
  const { bankSampah, nasabahList, inventarisList, summary, generatedAt } = data

  // 📄 Create PDF document
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  })

  // 🎨 Colors
  const primaryColor = [37, 99, 235] // Blue
  const greenColor = [5, 150, 105] // Green
  const redColor = [220, 38, 38] // Red
  const grayColor = [107, 114, 128] // Gray
  const lightGray = [243, 244, 246] // Light gray for backgrounds

  let yPosition = 25

  // 📋 Header Section - More Professional
  doc.setFontSize(22)
  doc.setTextColor(...primaryColor)
  doc.text("LAPORAN BACKUP DATA", 105, yPosition, { align: "center" })
  yPosition += 8

  doc.setFontSize(18)
  doc.setTextColor(0, 0, 0)
  doc.text(bankSampah?.nama || "Bank Sampah", 105, yPosition, { align: "center" })
  yPosition += 12

  // Info Box
  doc.setFillColor(...lightGray)
  doc.rect(20, yPosition, 170, 20, "F")

  doc.setFontSize(10)
  doc.setTextColor(...grayColor)
  doc.text(`Alamat: ${bankSampah?.alamat}`, 25, yPosition + 6)
  doc.text(`Telepon: ${bankSampah?.telepon}`, 25, yPosition + 11)
  doc.text(`Email: ${bankSampah?.email}`, 25, yPosition + 16)

  doc.text(`Tanggal Generate:`, 130, yPosition + 6)
  doc.text(`${new Date(generatedAt).toLocaleDateString("id-ID")}`, 130, yPosition + 11)
  doc.text(`${new Date(generatedAt).toLocaleTimeString("id-ID")}`, 130, yPosition + 16)

  yPosition += 30

  // 📊 Summary Section - Better Layout
  doc.setFontSize(16)
  doc.setTextColor(...primaryColor)
  doc.text("RINGKASAN DATA", 20, yPosition)
  yPosition += 8

  // Draw summary boxes in 2x4 grid
  const summaryItems = [
    { label: "Total Nasabah", value: summary.totalNasabah.toString(), color: primaryColor },
    { label: "Total Saldo", value: `Rp ${summary.totalSaldo.toLocaleString()}`, color: greenColor },
    { label: "Total Stok", value: `${summary.totalStok.toFixed(1)} kg`, color: primaryColor },
    { label: "Nilai Inventaris", value: `Rp ${summary.totalNilaiInventaris.toLocaleString()}`, color: greenColor },
    { label: "Total Pembelian", value: `Rp ${summary.totalPemasukan.toLocaleString()}`, color: redColor },
    { label: "Total Penjualan", value: `Rp ${summary.totalPenjualan.toLocaleString()}`, color: greenColor },
    { label: "Total Penarikan", value: `Rp ${summary.totalPengeluaran.toLocaleString()}`, color: redColor },
    {
      label: "Keuntungan Bersih",
      value: `Rp ${summary.keuntungan.toLocaleString()}`,
      color: summary.keuntungan >= 0 ? greenColor : redColor,
    },
  ]

  // Draw 2x4 grid
  for (let i = 0; i < summaryItems.length; i++) {
    const col = i % 2
    const row = Math.floor(i / 2)
    const x = 20 + col * 85
    const y = yPosition + row * 18

    // Box background
    doc.setFillColor(250, 250, 250)
    doc.rect(x, y, 80, 15, "F")
    doc.setDrawColor(200, 200, 200)
    doc.rect(x, y, 80, 15, "S")

    // Label
    doc.setFontSize(8)
    doc.setTextColor(...grayColor)
    doc.text(summaryItems[i].label, x + 2, y + 5)

    // Value
    doc.setFontSize(10)
    doc.setTextColor(...summaryItems[i].color)
    doc.text(summaryItems[i].value, x + 2, y + 11)
  }

  yPosition += 80

  // 👥 Nasabah Table - Better Formatting
  doc.setFontSize(16)
  doc.setTextColor(...primaryColor)
  doc.text(`DATA NASABAH (${nasabahList.length} orang)`, 20, yPosition)
  yPosition += 8

  // Prepare nasabah table data - limit to 20 for better layout
  const nasabahTableData = nasabahList
    .slice(0, 20)
    .map((nasabah: any, index: number) => [
      (index + 1).toString(),
      nasabah.nama,
      nasabah.email,
      nasabah.telepon,
      `Rp ${nasabah.saldo.toLocaleString()}`,
      new Date(nasabah.createdAt).toLocaleDateString("id-ID"),
    ])

  // Add total row
  nasabahTableData.push([
    "",
    `TOTAL (${nasabahList.length} nasabah)`,
    "",
    "",
    `Rp ${summary.totalSaldo.toLocaleString()}`,
    "",
  ])

  doc.autoTable({
    startY: yPosition,
    head: [["No", "Nama Lengkap", "Email", "Telepon", "Saldo", "Tgl Daftar"]],
    body: nasabahTableData,
    theme: "grid",
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontSize: 9,
      fontStyle: "bold",
      halign: "center",
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [0, 0, 0],
    },
    columnStyles: {
      0: { cellWidth: 12, halign: "center" }, // No
      1: { cellWidth: 45 }, // Nama
      2: { cellWidth: 50 }, // Email
      3: { cellWidth: 28 }, // Telepon
      4: { cellWidth: 30, halign: "right" }, // Saldo
      5: { cellWidth: 25, halign: "center" }, // Tgl Daftar
    },
    didParseCell: (data: any) => {
      // Style total row
      if (data.row.index === nasabahTableData.length - 1) {
        data.cell.styles.fillColor = lightGray
        data.cell.styles.fontStyle = "bold"
        data.cell.styles.textColor = primaryColor
      }
    },
    margin: { left: 20, right: 20 },
  })

  // 📦 New page for Inventaris
  doc.addPage()
  yPosition = 25

  // Header on second page
  doc.setFontSize(16)
  doc.setTextColor(...primaryColor)
  doc.text(`DATA INVENTARIS SAMPAH (${inventarisList.length} jenis)`, 20, yPosition)
  yPosition += 8

  // Prepare inventaris table data
  const inventarisTableData = inventarisList.map((item: any, index: number) => [
    (index + 1).toString(),
    item.jenisSampah,
    item.isActive ? "Aktif" : "Non-aktif",
    `Rp ${item.hargaPerKg.toLocaleString()}`,
    `${item.stokKg.toFixed(1)} kg`,
    `Rp ${(item.stokKg * item.hargaPerKg).toLocaleString()}`,
    new Date(item.createdAt).toLocaleDateString("id-ID"),
  ])

  // Add total row
  inventarisTableData.push([
    "",
    `TOTAL (${inventarisList.length} jenis sampah)`,
    "",
    "",
    `${summary.totalStok.toFixed(1)} kg`,
    `Rp ${summary.totalNilaiInventaris.toLocaleString()}`,
    "",
  ])

  doc.autoTable({
    startY: yPosition,
    head: [["No", "Jenis Sampah", "Status", "Harga/kg", "Stok", "Total Nilai", "Tgl Buat"]],
    body: inventarisTableData,
    theme: "grid",
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontSize: 9,
      fontStyle: "bold",
      halign: "center",
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [0, 0, 0],
    },
    columnStyles: {
      0: { cellWidth: 12, halign: "center" }, // No
      1: { cellWidth: 45 }, // Jenis Sampah
      2: { cellWidth: 20, halign: "center" }, // Status
      3: { cellWidth: 25, halign: "right" }, // Harga/kg
      4: { cellWidth: 20, halign: "right" }, // Stok
      5: { cellWidth: 30, halign: "right" }, // Total Nilai
      6: { cellWidth: 22, halign: "center" }, // Tgl Buat
    },
    didParseCell: (data: any) => {
      // Color status column
      if (data.column.index === 2 && data.row.index < inventarisList.length) {
        const item = inventarisList[data.row.index]
        if (item.isActive) {
          data.cell.styles.textColor = greenColor
          data.cell.styles.fontStyle = "bold"
        } else {
          data.cell.styles.textColor = redColor
          data.cell.styles.fontStyle = "bold"
        }
      }
      // Style total row
      if (data.row.index === inventarisTableData.length - 1) {
        data.cell.styles.fillColor = lightGray
        data.cell.styles.fontStyle = "bold"
        data.cell.styles.textColor = primaryColor
      }
    },
    margin: { left: 20, right: 20 },
  })

  // 📄 Professional Footer
  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)

    // Footer background
    doc.setFillColor(...lightGray)
    doc.rect(0, 275, 210, 22, "F")

    doc.setFontSize(8)
    doc.setTextColor(...grayColor)

    // Footer content
    const footerY = 282
    doc.text("Laporan ini dibuat secara otomatis oleh Sistem Bank Sampah", 105, footerY, { align: "center" })
    doc.text("Data bersifat rahasia dan hanya untuk keperluan backup internal", 105, footerY + 4, { align: "center" })
    doc.text(`Generated: ${new Date(generatedAt).toLocaleString("id-ID")}`, 105, footerY + 8, { align: "center" })

    // Page number with better styling
    doc.setFontSize(9)
    doc.setTextColor(...primaryColor)
    doc.text(`Halaman ${i} dari ${pageCount}`, 190, footerY + 12, { align: "right" })

    // Company name on left
    doc.setFontSize(8)
    doc.setTextColor(...grayColor)
    doc.text(bankSampah?.nama || "Bank Sampah", 20, footerY + 12)
  }

  // Convert to buffer
  const pdfArrayBuffer = doc.output("arraybuffer")
  return Buffer.from(pdfArrayBuffer)
}
