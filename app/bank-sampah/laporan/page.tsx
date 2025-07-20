import { redirect } from "next/navigation"
import { getSession } from "@/lib/session"
import { getLaporanPendapatan } from "@/app/actions/laporan"
import LayoutWrapper from "@/components/layout-wrapper"
import LaporanClient from "@/components/laporan-client" // 🆕 Import client component

export default async function LaporanPage() {
  const session = await getSession()

  if (!session || session.userType !== "bank-sampah") {
    redirect("/")
  }

  // 🚀 Fetch initial data on the server
  const initialLaporanData = await getLaporanPendapatan(session.userId)

  return (
    <LayoutWrapper userType="bank-sampah">
      <div className="max-w-7xl mx-auto py-6 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">📊 Laporan Pendapatan</h1>
          <p className="text-gray-600">Analisis pendapatan dari sampah masuk dan keluar dengan filter tanggal</p>
        </div>

        {/* 🆕 Pass initial data and userId to client component */}
        <LaporanClient initialData={initialLaporanData} bankSampahId={session.userId} />
      </div>
    </LayoutWrapper>
  )
}
