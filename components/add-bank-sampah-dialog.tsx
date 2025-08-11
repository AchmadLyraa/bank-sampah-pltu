"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createBankSampah } from "@/app/actions/controller"

interface AddBankSampahDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function AddBankSampahDialog({ open, onOpenChange, onSuccess }: AddBankSampahDialogProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (formData: FormData) => {
    setLoading(true)
    setError("")

    try {
      const result = await createBankSampah(formData)

      if (result.success) {
        onSuccess?.()
        onOpenChange(false)
      } else {
        setError(result.error || "Terjadi kesalahan")
      }
    } catch (error) {
      setError("Terjadi kesalahan sistem")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Tambah Bank Sampah</DialogTitle>
          <DialogDescription>Tambahkan bank sampah baru ke sistem</DialogDescription>
        </DialogHeader>

        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nama">Nama Bank Sampah</Label>
            <Input id="nama" name="nama" placeholder="Masukkan nama bank sampah" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="alamat">Alamat</Label>
            <Input id="alamat" name="alamat" placeholder="Masukkan alamat lengkap" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="telepon">Telepon</Label>
            <Input id="telepon" name="telepon" placeholder="Masukkan nomor telepon" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" placeholder="Masukkan email" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" placeholder="Masukkan password" required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="latitude">Latitude (Opsional)</Label>
              <Input id="latitude" name="latitude" type="number" step="any" placeholder="-6.2088" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="longitude">Longitude (Opsional)</Label>
              <Input id="longitude" name="longitude" type="number" step="any" placeholder="106.8456" />
            </div>
          </div>

          {error && <div className="text-red-600 text-sm">{error}</div>}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Batal
            </Button>
            <Button type="submit" disabled={loading} className="bg-green-600 hover:bg-green-700">
              {loading ? "Menyimpan..." : "Simpan"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
