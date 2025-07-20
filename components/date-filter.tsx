"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar, Filter, Clock } from "lucide-react"

interface DateFilterProps {
  onFilterChange: (startDate: Date | null, endDate: Date | null) => void
  loading?: boolean
}

export default function DateFilter({ onFilterChange, loading = false }: DateFilterProps) {
  const [filterType, setFilterType] = useState<"static" | "dynamic">("static")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")

  // 📅 Static filter options
  const staticFilters = [
    { label: "Hari Ini", days: 0 },
    { label: "7 Hari", days: 7 },
    { label: "14 Hari", days: 14 },
    { label: "30 Hari", days: 30 },
    { label: "Semua Data", days: null },
  ]

  // 🗓️ Handle static filter
  const handleStaticFilter = (days: number | null) => {
    if (days === null) {
      // Show all data
      onFilterChange(null, null)
      return
    }

    const endDate = new Date()
    endDate.setHours(23, 59, 59, 999) // End of today

    const startDate = new Date()
    if (days === 0) {
      // Today only
      startDate.setHours(0, 0, 0, 0)
    } else {
      // X days ago
      startDate.setDate(startDate.getDate() - days)
      startDate.setHours(0, 0, 0, 0)
    }

    console.log("📅 Static filter:", { days, startDate, endDate })
    onFilterChange(startDate, endDate)
  }

  // 🗓️ Handle dynamic filter
  const handleDynamicFilter = () => {
    if (!startDate || !endDate) {
      alert("Pilih tanggal mulai dan tanggal akhir!")
      return
    }

    const start = new Date(startDate)
    start.setHours(0, 0, 0, 0)

    const end = new Date(endDate)
    end.setHours(23, 59, 59, 999)

    if (start > end) {
      alert("Tanggal mulai tidak boleh lebih besar dari tanggal akhir!")
      return
    }

    console.log("📅 Dynamic filter:", { startDate: start, endDate: end })
    onFilterChange(start, end)
  }

  // 🔄 Reset filter
  const handleReset = () => {
    setStartDate("")
    setEndDate("")
    onFilterChange(null, null)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Filter Tanggal
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filter Type Toggle */}
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={filterType === "static" ? "default" : "outline"}
            onClick={() => setFilterType("static")}
            className="flex items-center gap-1"
          >
            <Clock className="h-3 w-3" />
            Quick Filter
          </Button>
          <Button
            size="sm"
            variant={filterType === "dynamic" ? "default" : "outline"}
            onClick={() => setFilterType("dynamic")}
            className="flex items-center gap-1"
          >
            <Calendar className="h-3 w-3" />
            Custom Range
          </Button>
        </div>

        {/* Static Filters */}
        {filterType === "static" && (
          <div className="space-y-3">
            <Label className="text-sm font-medium">Pilih Periode:</Label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              {staticFilters.map((filter) => (
                <Button
                  key={filter.label}
                  size="sm"
                  variant="outline"
                  onClick={() => handleStaticFilter(filter.days)}
                  disabled={loading}
                  className="text-xs"
                >
                  {filter.label}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Dynamic Filters */}
        {filterType === "dynamic" && (
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start-date">Tanggal Mulai</Label>
                <Input id="start-date" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end-date">Tanggal Akhir</Label>
                <Input id="end-date" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleDynamicFilter} disabled={loading || !startDate || !endDate} className="flex-1">
                <Filter className="h-4 w-4 mr-2" />
                Terapkan Filter
              </Button>
              <Button variant="outline" onClick={handleReset} disabled={loading}>
                Reset
              </Button>
            </div>
          </div>
        )}

        {/* Current Filter Info */}
        <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
          💡 <strong>Tips:</strong> Gunakan Quick Filter untuk periode umum, atau Custom Range untuk tanggal spesifik
        </div>
      </CardContent>
    </Card>
  )
}
