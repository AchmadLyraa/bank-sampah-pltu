"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { createInventarisAction } from "@/app/actions/inventaris-management"
import { PackagePlus, Loader2 } from "lucide-react"

interface TambahInventarisModalProps {
  bankSampahId: string
}

export default function TambahInventarisModal({ bankSampahId }: TambahInventarisModalProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setMessage(null)

    // Add bankSampahId to formData
    formData.append("bankSampahId", bankSampahId)

    try {
      const result = await createInventarisAction(formData)

      if (result.error) {
        setMessage({ type: "error", text: result.error })
      } else {
        setMessage({ type: "success", text: "Jenis sampah berhasil ditambahkan!" })
        // Reset form
        const form = document.getElementById("modal-tambah-inventaris-form") as HTMLFormElement
        form?.reset()
        // Close modal after success
        setTimeout(() => {
          setOpen(false)
          setMessage(null)
        }, 1500)
      }
    } catch (error) {
      setMessage({ type: "error", text: "Terjadi kesalahan saat menambahkan jenis sampah" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <PackagePlus className="h-4 w-4" />
          Tambah Jenis Sampah
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PackagePlus className="h-5 w-5" />
            Tambah Jenis Sampah Baru
          </DialogTitle>
        </DialogHeader>

        <form id="modal-tambah-inventaris-form" action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="modal-jenis-sampah">Jenis Sampah</Label>
            <Input
              id="modal-jenis-sampah"
              name="jenisSampah"
              placeholder="Contoh: Plastik Botol, Kertas Koran, dll"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="modal-harga-per-kg">Harga per Kg (Rp)</Label>
            <Input
              id="modal-harga-per-kg"
              name="hargaPerKg"
              type="number"
              min="1"
              step="1"
              placeholder="Contoh: 2000"
              required
            />
          </div>

          <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
            <p className="font-medium text-blue-900">Catatan:</p>
            <p className="text-blue-700">• Stok awal akan dimulai dari 0 kg</p>
            <p className="text-blue-700">• Harga dapat diubah kapan saja</p>
          </div>

          {message && (
            <div
              className={`p-3 rounded-lg text-sm ${
                message.type === "success"
                  ? "bg-green-50 text-green-800 border border-green-200"
                  : "bg-red-50 text-red-800 border border-red-200"
              }`}
            >
              {message.text}
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1"
              disabled={loading}
            >
              Batal
            </Button>
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Tambah Jenis Sampah
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
