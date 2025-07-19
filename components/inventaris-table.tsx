"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { updateInventarisAction, penjualanSampahAction } from "@/app/actions/bank-sampah"
import { deleteInventarisAction } from "@/app/actions/inventaris-management"
import { Edit2, Package, Loader2, Trash2 } from "lucide-react"
import type { InventarisSampah } from "@/types"

interface InventarisTableProps {
  inventaris: InventarisSampah[]
}

export default function InventarisTable({ inventaris }: InventarisTableProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editPrice, setEditPrice] = useState<number>(0)
  const [loading, setLoading] = useState<string | null>(null)
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null)

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

  const handleSellWaste = async (item: InventarisSampah, beratKg: number, hargaJual: number) => {
    setLoading(item.id)
    const formData = new FormData()
    formData.append("inventarisSampahId", item.id)
    formData.append("beratKg", beratKg.toString())
    formData.append("hargaJual", hargaJual.toString())

    try {
      await penjualanSampahAction(formData)
    } catch (error) {
      alert("Terjadi kesalahan saat menjual sampah")
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="space-y-6">
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
                  <th className="text-left py-3 px-4">Jenis Sampah</th>
                  <th className="text-left py-3 px-4">Harga/kg</th>
                  <th className="text-left py-3 px-4">Stok (kg)</th>
                  <th className="text-left py-3 px-4">Total Nilai</th>
                  <th className="text-left py-3 px-4">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {inventaris.map((item) => (
                  <tr key={item.id} className="border-b">
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
                    <td className="py-3 px-4">{item.stokKg.toFixed(1)} kg</td>
                    <td className="py-3 px-4">Rp {(item.stokKg * item.hargaPerKg).toLocaleString()}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        {item.stokKg > 0 && (
                          <SellWasteForm item={item} onSell={handleSellWaste} loading={loading === item.id} />
                        )}

                        {/* Delete Button */}
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

function SellWasteForm({
  item,
  onSell,
  loading,
}: {
  item: InventarisSampah
  onSell: (item: InventarisSampah, beratKg: number, hargaJual: number) => void
  loading: boolean
}) {
  const [showForm, setShowForm] = useState(false)
  const [beratKg, setBeratKg] = useState<number>(0)
  const [hargaJual, setHargaJual] = useState<number>(0)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (beratKg > 0 && hargaJual > 0 && beratKg <= item.stokKg) {
      onSell(item, beratKg, hargaJual)
      setShowForm(false)
      setBeratKg(0)
      setHargaJual(0)
    }
  }

  if (!showForm) {
    return (
      <Button size="sm" variant="outline" onClick={() => setShowForm(true)}>
        Jual
      </Button>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 items-center">
      <Input
        type="number"
        step="0.1"
        max={item.stokKg}
        placeholder="Berat"
        value={beratKg || ""}
        onChange={(e) => setBeratKg(Number.parseFloat(e.target.value) || 0)}
        className="w-20"
        required
      />
      <Input
        type="number"
        placeholder="Harga"
        value={hargaJual || ""}
        onChange={(e) => setHargaJual(Number.parseFloat(e.target.value) || 0)}
        className="w-24"
        required
      />
      <Button type="submit" size="sm" disabled={loading}>
        {loading && <Loader2 className="h-3 w-3 animate-spin mr-1" />}
        OK
      </Button>
      <Button type="button" size="sm" variant="outline" onClick={() => setShowForm(false)}>
        X
      </Button>
    </form>
  )
}
