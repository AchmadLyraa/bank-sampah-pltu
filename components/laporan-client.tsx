"use client"

import { useState } from "react"
import { getLaporanPendapatan } from "@/app/actions/laporan"
import LaporanPendapatan from "@/components/laporan-pendapatan"
import DateFilter from "@/components/date-filter"
import BackupDownloadButton from "@/components/backup-download-button" // 🆕 Import
import { Loader2 } from "lucide-react"

interface LaporanClientProps {
  initialData: Awaited<ReturnType<typeof getLaporanPendapatan>>
  bankSampahId: string
}

export default function LaporanClient({ initialData, bankSampahId }: LaporanClientProps) {
  const [laporanData, setLaporanData] = useState(initialData)
  const [filterLoading, setFilterLoading] = useState(false)

  const loadLaporanData = async (startDate: Date | null, endDate: Date | null) => {
    setFilterLoading(true)
    try {
      const data = await getLaporanPendapatan(bankSampahId, startDate || undefined, endDate || undefined)
      setLaporanData(data)
    } catch (error) {
      console.error("❌ Error loading laporan:", error)
    } finally {
      setFilterLoading(false)
    }
  }

  const handleFilterChange = (startDate: Date | null, endDate: Date | null) => {
    loadLaporanData(startDate, endDate)
  }

  return (
    <>
      {/* 🆕 Backup Download Section */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex sm:items-center items-start justify-between sm:flex-row flex-col">
          <div className="mb-3 sm:mb-0">
            <h3 className="font-semibold text-blue-900">💾 Backup Data</h3>
            <p className="text-sm text-blue-700">Download semua data nasabah, inventaris, dan ringkasan untuk backup</p>
          </div>
          <BackupDownloadButton />
        </div>
      </div>

      {/* Date Filter */}
      <div className="mb-6">
        <DateFilter onFilterChange={handleFilterChange} loading={filterLoading} />
      </div>

      {/* Laporan Content */}
      {filterLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="ml-2">Memfilter data...</span>
        </div>
      ) : laporanData ? (
        <LaporanPendapatan data={laporanData} />
      ) : (
        <div className="text-center py-12 text-gray-500">
          <p>Tidak ada data laporan</p>
        </div>
      )}
    </>
  )
}
