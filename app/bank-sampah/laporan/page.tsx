import { redirect } from "next/navigation"
import { getSession } from "@/lib/session"
import { getLaporanPendapatan } from "@/app/actions/laporan"
import LayoutWrapper from "@/components/layout-wrapper"
import LaporanPendapatan from "@/components/laporan-pendapatan"

export default async function LaporanPage() {
  const session = await getSession()

  if (!session || session.userType !== "bank-sampah") {
    redirect("/")
  }

  const laporanData = await getLaporanPendapatan(session.userId)

  return (
    <LayoutWrapper userType="bank-sampah">
      <div className="max-w-7xl mx-auto py-6 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Laporan Pendapatan</h1>
          <p className="text-gray-600">Analisis pendapatan dari sampah masuk dan keluar</p>
        </div>

        <LaporanPendapatan data={laporanData} />
      </div>
    </LayoutWrapper>
  )
}
