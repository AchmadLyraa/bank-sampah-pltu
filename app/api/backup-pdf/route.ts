import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/session"
import { getBackupData } from "@/app/actions/backup"
import { generateBackupPDF } from "@/lib/pdf-generator"

export async function GET(request: NextRequest) {
  try {
    // 🔐 Check session
    const session = await getSession()
    if (!session || session.userType !== "bank-sampah") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // 📊 Get backup data
    const backupData = await getBackupData(session.userId)

    // 📄 Generate PDF buffer using jsPDF
    const pdfBuffer = await generateBackupPDF(backupData)

    // 🎯 Return PDF file
    const fileName = `backup-${backupData.bankSampah?.nama?.replace(/\s+/g, "-")}-${new Date().toISOString().split("T")[0]}.pdf`

    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
    })
  } catch (error) {
    console.error("Error generating backup PDF:", error)
    return NextResponse.json({ error: "Gagal membuat laporan backup PDF" }, { status: 500 })
  }
}
