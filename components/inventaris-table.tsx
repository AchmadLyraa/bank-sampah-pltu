"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { updateInventarisAction, penjualanSampahAction } from "@/app/actions/bank-sampah"
import { deleteInventarisAction, toggleInventarisStatusAction } from "@/app/actions/inventaris-management"
import { Edit2, Package, Loader2, Trash2, DollarSign, Power, PowerOff } from "lucide-react"
import type { InventarisSampah } from "@/types"

interface InventarisTableProps {
  inventaris: InventarisSampah[]
}

export default function InventarisTable({ inventaris }: InventarisTableProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editPrice, setEditPrice] = useState<number>(0)
  const [loading, setLoading] = useState<string | null>(null)
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null)
  const [sellLoading, setSellLoading] = useState<string | null>(null)
  const [toggleLoading, setToggleLoading] = useState<string | null>(null) // 🆕 NEW
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const handleEdit = (item: InventarisSampah) => {
    setEditingId(item.id)
    setEditPrice(item.hargaPerKg)
  }

  const handleSave = async (id: string) => {
    setLoading(id)
    const formData = new FormData()
    formData.append("id", id)
    formData.append("hargaPerKg", editPrice.toString())

    await updateInventarisAction(formData)
    setEditingId(null)
    setLoading(null)
  }

  const handleDelete = async (item: InventarisSampah) => {
    if (item.stokKg > 0) {
      alert("Tidak dapat menghapus jenis sampah yang masih memiliki stok!")
      return
    }

    const confirmDelete = confirm(
      `Apakah Anda yakin ingin menghapus jenis sampah "${item.jenisSampah}"?\n\nTindakan ini tidak dapat dibatalkan.`,
    )

    if (!confirmDelete) return

    setDeleteLoading(item.id)
    const formData = new FormData()
    formData.append("id", item.id)

    try {
      const result = await deleteInventarisAction(formData)
      if (result.error) {
        alert(result.error)
      }
    } catch (error) {
      alert("Terjadi kesalahan saat menghapus jenis sampah")
    } finally {
      setDeleteLoading(null)
    }
  }

  // 🆕 NEW: Toggle active/inactive status
  const handleToggleStatus = async (item: InventarisSampah) => {
    const newStatus = !item.isActive
    const confirmMessage = newStatus
      ? `Aktifkan kembali "${item.jenisSampah}"?\n\nSampah ini akan muncul di form penimbangan.`
      : `Non-aktifkan "${item.jenisSampah}"?\n\nSampah ini tidak akan muncul di form penimbangan.`

    if (!confirm(confirmMessage)) return

    setToggleLoading(item.id)
    const formData = new FormData()
    formData.append("id", item.id)
    formData.append("isActive", item.isActive.toString())

    try {
      const result = await toggleInventarisStatusAction(formData)
      if (result.error) {
        alert(result.error)
      } else {
        setMessage({
          type: "success",
          text: `${item.jenisSampah} berhasil ${newStatus ? "diaktifkan" : "dinonaktifkan"}!`,
        })
        setTimeout(() => setMessage(null), 3000)
      }
    } catch (error) {
      alert("Terjadi kesalahan saat mengubah status")
    } finally {
      setToggleLoading(null)
    }
  }

  const handleSellWaste = async (item: InventarisSampah, beratKg: number, hargaPerKg: number) => {
    setSellLoading(item.id)
    setMessage(null)

    try {
      const formData = new FormData()
      formData.append("inventarisSampahId", item.id)
      formData.append("beratKg", beratKg.toString())
      formData.append("hargaPerKg", hargaPerKg.toString())

      const result = await penjualanSampahAction(formData)

      if (result.success) {
        setMessage({ type: "success", text: result.message || "Penjualan berhasil!" })
        setTimeout(() => setMessage(null), 3000)
      }
    } catch (error: any) {
      setMessage({ type: "error", text: error.message || "Terjadi kesalahan saat menjual sampah" })
      setTimeout(() => setMessage(null), 5000)
    } finally {
      setSellLoading(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Success/Error Message */}
      {message && (
        <div
          className={`p-4 rounded-lg border ${
            message.type === "success"
              ? "bg-green-50 text-green-800 border-green-200"
              : "bg-red-50 text-red-800 border-red-200"
          }`}
        >
          {message.text}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Daftar Inventaris
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Status</th>
                  <th className="text-left py-3 px-4">Jenis Sampah</th>
                  <th className="text-left py-3 px-4">Harga Beli/kg</th>
                  <th className="text-left py-3 px-4">Stok (kg)</th>
                  <th className="text-left py-3 px-4">Total Nilai</th>
                  <th className="text-left py-3 px-4">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {inventaris.map((item) => (
                  <tr key={item.id} className={`border-b ${!item.isActive ? "bg-gray-50 opacity-75" : ""}`}>
                    {/* 🆕 Status Column */}
                    <td className="py-3 px-4">
                      <Badge
                        variant={item.isActive ? "default" : "secondary"}
                        className={item.isActive ? "bg-green-100 text-green-800" : ""}
                      >
                        {item.isActive ? "Aktif" : "Non-aktif"}
                      </Badge>
                    </td>

                    <td className="py-3 px-4 font-medium">{item.jenisSampah}</td>
                    <td className="py-3 px-4">
                      {editingId === item.id ? (
                        <div className="flex gap-2">
                          <Input
                            type="number"
                            value={editPrice}
                            onChange={(e) => setEditPrice(Number.parseFloat(e.target.value) || 0)}
                            className="w-24"
                          />
                          <Button size="sm" onClick={() => handleSave(item.id)} disabled={loading === item.id}>
                            {loading === item.id && <Loader2 className="h-3 w-3 animate-spin mr-1" />}
                            Simpan
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>
                            Batal
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span>Rp {item.hargaPerKg.toLocaleString()}</span>
                          <Button size="sm" variant="ghost" onClick={() => handleEdit(item)}>
                            <Edit2 className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className={item.stokKg > 0 ? "text-green-600 font-medium" : "text-gray-500"}>
                        {item.stokKg.toFixed(1)} kg
                      </span>
                    </td>
                    <td className="py-3 px-4">Rp {(item.stokKg * item.hargaPerKg).toLocaleString()}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        {/* 🆕 Toggle Status Button */}
                        <Button
                          size="sm"
                          variant={item.isActive ? "outline" : "default"}
                          onClick={() => handleToggleStatus(item)}
                          disabled={toggleLoading === item.id}
                          className={
                            item.isActive ? "text-orange-600 hover:text-orange-700" : "bg-green-600 hover:bg-green-700"
                          }
                        >
                          {toggleLoading === item.id ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : item.isActive ? (
                            <PowerOff className="h-3 w-3" />
                          ) : (
                            <Power className="h-3 w-3" />
                          )}
                        </Button>

                        {/* Sell Button - Only show if active and has stock */}
                        {item.isActive && item.stokKg > 0 && (
                          <SellWasteForm item={item} onSell={handleSellWaste} loading={sellLoading === item.id} />
                        )}

                        {/* Delete Button - Only show if no transactions */}
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(item)}
                          disabled={deleteLoading === item.id}
                          title={
                            item.stokKg > 0
                              ? "Tidak dapat menghapus sampah yang masih memiliki stok"
                              : "Hapus jenis sampah"
                          }
                        >
                          {deleteLoading === item.id ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <Trash2 className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Sell Waste Form Component (unchanged)
function SellWasteForm({
  item,
  onSell,
  loading,
}: {
  item: InventarisSampah
  onSell: (item: InventarisSampah, beratKg: number, hargaPerKg: number) => void
  loading: boolean
}) {
  const [showForm, setShowForm] = useState(false)
  const [beratKg, setBeratKg] = useState<number>(0)
  const [hargaPerKg, setHargaPerKg] = useState<number>(0)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!beratKg || beratKg <= 0) {
      alert("Masukkan berat yang valid!")
      return
    }

    if (!hargaPerKg || hargaPerKg <= 0) {
      alert("Masukkan harga jual per kg yang valid!")
      return
    }

    if (beratKg > item.stokKg) {
      alert(`Berat melebihi stok! Stok tersedia: ${item.stokKg}kg`)
      return
    }

    onSell(item, beratKg, hargaPerKg)

    setShowForm(false)
    setBeratKg(0)
    setHargaPerKg(0)
  }

  const handleCancel = () => {
    setShowForm(false)
    setBeratKg(0)
    setHargaPerKg(0)
  }

  const totalPreview = beratKg > 0 && hargaPerKg > 0 ? beratKg * hargaPerKg : 0

  if (!showForm) {
    return (
      <Button
        size="sm"
        variant="outline"
        onClick={() => setShowForm(true)}
        className="flex items-center gap-1"
        disabled={loading}
      >
        <DollarSign className="h-3 w-3" />
        Jual
      </Button>
    )
  }

  return (
    <div className="flex flex-col gap-2 p-3 border rounded-lg bg-gray-50 min-w-[320px]">
      <div className="text-sm font-medium text-gray-700">
        🏷️ Jual {item.jenisSampah} (Stok: {item.stokKg}kg)
      </div>

      <div className="text-xs text-gray-500">💡 Harga beli: Rp{item.hargaPerKg.toLocaleString()}/kg</div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div className="flex gap-2">
          <div className="flex-1">
            <label className="text-xs text-gray-600 font-medium">Berat (kg)</label>
            <Input
              type="number"
              step="0.1"
              min="0.1"
              max={item.stokKg}
              placeholder="0.0"
              value={beratKg || ""}
              onChange={(e) => setBeratKg(Number.parseFloat(e.target.value) || 0)}
              className="h-8"
              required
            />
          </div>

          <div className="flex-1">
            <label className="text-xs text-gray-600 font-medium">Harga Jual/kg</label>
            <Input
              type="number"
              min="1"
              placeholder="0"
              value={hargaPerKg || ""}
              onChange={(e) => setHargaPerKg(Number.parseFloat(e.target.value) || 0)}
              className="h-8"
              required
            />
          </div>
        </div>

        {totalPreview > 0 && (
          <div className="p-2 bg-green-50 border border-green-200 rounded text-center">
            <div className="text-sm text-green-700">
              📊 {beratKg}kg × Rp{hargaPerKg.toLocaleString()}/kg
            </div>
            <div className="text-lg font-bold text-green-800">= Rp {totalPreview.toLocaleString()}</div>
          </div>
        )}

        <div className="flex gap-2">
          <Button type="submit" size="sm" className="flex-1" disabled={loading || !beratKg || !hargaPerKg}>
            {loading && <Loader2 className="h-3 w-3 animate-spin mr-1" />}💰 Jual
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={handleCancel}
            className="flex-1 bg-transparent"
            disabled={loading}
          >
            ❌ Batal
          </Button>
        </div>
      </form>
    </div>
  )
}
