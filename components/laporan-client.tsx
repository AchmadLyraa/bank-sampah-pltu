"use client"

import { useState } from "react"
import { getLaporanPendapatan } from "@/app/actions/laporan" // Import Server Action
import LaporanPendapatan from "@/components/laporan-pendapatan"
import DateFilter from "@/components/date-filter"
import { Loader2 } from "lucide-react"

interface LaporanClientProps {
  initialData: Awaited<ReturnType<typeof getLaporanPendapatan>>
  bankSampahId: string
}

export default function LaporanClient({ initialData, bankSampahId }: LaporanClientProps) {
  const [laporanData, setLaporanData] = useState(initialData)
  const [filterLoading, setFilterLoading] = useState(false)

  // 📅 Function to load laporan data with date filter
  const loadLaporanData = async (startDate: Date | null, endDate: Date | null) => {
    setFilterLoading(true)
    try {
      console.log("🔄 Loading laporan with filter:", { startDate, endDate })
      // 🚀 Call the server action from client component
      // 🔧 FIXED: Convert null to undefined untuk match dengan parameter function
      const data = await getLaporanPendapatan(bankSampahId, startDate || undefined, endDate || undefined)
      setLaporanData(data)
    } catch (error) {
      console.error("❌ Error loading laporan:", error)
    } finally {
      setFilterLoading(false)
    }
  }

  // 🗓️ Handle filter change from DateFilter component
  const handleFilterChange = (startDate: Date | null, endDate: Date | null) => {
    console.log("📅 Filter changed:", { startDate, endDate })
    loadLaporanData(startDate, endDate)
  }

  return (
    <>
      {/* 🗓️ Date Filter */}
      <div className="mb-6">
        <DateFilter onFilterChange={handleFilterChange} loading={filterLoading} />
      </div>

      {/* 📊 Laporan Content */}
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
