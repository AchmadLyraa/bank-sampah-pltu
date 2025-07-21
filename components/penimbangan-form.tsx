"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { NasabahCombobox } from "@/components/nasabah-combobox"
import { penimbanganAction } from "@/app/actions/bank-sampah"
import { Plus, Trash2, Loader2 } from "lucide-react"
import type { Nasabah, InventarisSampah } from "@/types"

interface PenimbanganFormProps {
  nasabahList: Nasabah[]
  inventarisList: InventarisSampah[]
}

interface PenimbanganItem {
  inventarisSampahId: string
  beratKg: number
}

export default function PenimbanganForm({ nasabahList, inventarisList }: PenimbanganFormProps) {
  const [selectedNasabah, setSelectedNasabah] = useState("")
  const [items, setItems] = useState<PenimbanganItem[]>([{ inventarisSampahId: "", beratKg: 0 }])
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const addItem = () => {
    setItems([...items, { inventarisSampahId: "", beratKg: 0 }])
  }

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const updateItem = (index: number, field: keyof PenimbanganItem, value: string | number) => {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], [field]: value }
    setItems(newItems)
  }

  const calculateTotal = () => {
    return items.reduce((total, item) => {
      const inventaris = inventarisList.find((inv) => inv.id === item.inventarisSampahId)
      return total + (inventaris ? item.beratKg * inventaris.hargaPerKg : 0)
    }, 0)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedNasabah || items.some((item) => !item.inventarisSampahId || item.beratKg <= 0)) {
      alert("Mohon lengkapi semua data")
      return
    }

    setLoading(true)
    try {
      await penimbanganAction({
        nasabahId: selectedNasabah,
        items: items.filter((item) => item.inventarisSampahId && item.beratKg > 0),
      })
      setSuccess(true)
      setSelectedNasabah("")
      setItems([{ inventarisSampahId: "", beratKg: 0 }])
      setTimeout(() => setSuccess(false), 3000)
    } catch (error) {
      alert("Terjadi kesalahan saat menyimpan data")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Form Penimbangan</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label>Pilih Nasabah</Label>
            <NasabahCombobox
              nasabahList={nasabahList}
              value={selectedNasabah}
              onValueChange={setSelectedNasabah}
              placeholder="Cari dan pilih nasabah..."
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Item Sampah</Label>
              <Button type="button" onClick={addItem} size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Tambah Item
              </Button>
            </div>

            {items.map((item, index) => (
              <div key={index} className="flex gap-4 items-end p-4 border rounded-lg flex-wrap">
                <div className="flex-1">
                  <Label>Jenis Sampah</Label>
                  <Select
                    value={item.inventarisSampahId}
                    onValueChange={(value) => updateItem(index, "inventarisSampahId", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih jenis sampah..." />
                    </SelectTrigger>
                    <SelectContent>
                      {inventarisList.map((inventaris) => (
                        <SelectItem key={inventaris.id} value={inventaris.id}>
                          {inventaris.jenisSampah} - Rp {inventaris.hargaPerKg.toLocaleString()}/kg
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="w-32">
                  <Label>Berat (kg)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    value={item.beratKg || ""}
                    onChange={(e) => updateItem(index, "beratKg", Number.parseFloat(e.target.value) || 0)}
                    placeholder="0.0"
                  />
                </div>

                <div className="w-32">
                  <Label>Subtotal</Label>
                  <div className="h-10 px-3 py-2 border rounded-md bg-gray-50 text-sm">
                    Rp {(() => {
                      const inventaris = inventarisList.find((inv) => inv.id === item.inventarisSampahId)
                      return inventaris ? (item.beratKg * inventaris.hargaPerKg).toLocaleString() : "0"
                    })()}
                  </div>
                </div>

                {items.length > 1 && (
                  <Button type="button" onClick={() => removeItem(index)} size="sm" variant="destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
            <span className="text-lg font-semibold">Total:</span>
            <span className="text-xl font-bold text-green-600">Rp {calculateTotal().toLocaleString()}</span>
          </div>

          {success && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
              Penimbangan berhasil disimpan!
            </div>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Simpan Penimbangan
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
