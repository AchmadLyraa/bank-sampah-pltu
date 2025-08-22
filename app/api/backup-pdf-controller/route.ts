import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { getBackupData } from "@/app/actions/backup";
import { generateBackupPDF } from "@/lib/pdf-generator";

export async function GET(request: NextRequest) {
  try {
    // 🔐 Check session
    const session = await getServerSession(authOptions);

    if (!session || !session.user || session.user.userType !== "controller") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const bankSampahId = searchParams.get("bankSampahId");

    // 📊 Get backup data
    const backupData = await getBackupData(bankSampahId || "");
    console.log(session);

    // 📄 Generate PDF buffer using jsPDF
    const pdfBuffer = await generateBackupPDF(backupData);

    // 🎯 Return PDF file
    const fileName = `backup-${backupData.bankSampah?.nama?.replace(/\s+/g, "-")}-${new Date().toISOString().split("T")[0]}.pdf`;

    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
    });
  } catch (error) {
    console.error("Error generating backup PDF:", error);
    return NextResponse.json(
      { error: "Gagal membuat laporan backup PDF" },
      { status: 500 },
    );
  }
}
