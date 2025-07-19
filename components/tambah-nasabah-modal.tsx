"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { createNasabahAction } from "@/app/actions/nasabah-management"
import { UserPlus, Loader2 } from "lucide-react"

interface TambahNasabahModalProps {
  bankSampahId: string
}

export default function TambahNasabahModal({ bankSampahId }: TambahNasabahModalProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setMessage(null)

    // Add bankSampahId to formData
    formData.append("bankSampahId", bankSampahId)

    try {
      const result = await createNasabahAction(formData)

      if (result.error) {
        setMessage({ type: "error", text: result.error })
      } else {
        setMessage({ type: "success", text: "Nasabah berhasil ditambahkan!" })
        // Reset form
        const form = document.getElementById("modal-tambah-nasabah-form") as HTMLFormElement
        form?.reset()
        // Close modal after success
        setTimeout(() => {
          setOpen(false)
          setMessage(null)
        }, 1500)
      }
    } catch (error) {
      setMessage({ type: "error", text: "Terjadi kesalahan saat menambahkan nasabah" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <UserPlus className="h-4 w-4" />
          Tambah Nasabah
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Tambah Nasabah Baru
          </DialogTitle>
        </DialogHeader>

        <form id="modal-tambah-nasabah-form" action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="modal-nama">Nama Lengkap</Label>
            <Input id="modal-nama" name="nama" placeholder="Masukkan nama lengkap" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="modal-email">Email</Label>
            <Input id="modal-email" name="email" type="email" placeholder="email@example.com" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="modal-password">Password</Label>
            <Input id="modal-password" name="password" type="password" placeholder="Password untuk login" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="modal-telepon">Telepon</Label>
            <Input id="modal-telepon" name="telepon" placeholder="08xxxxxxxxxx" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="modal-alamat">Alamat</Label>
            <Textarea id="modal-alamat" name="alamat" placeholder="Alamat lengkap nasabah" rows={3} required />
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
              Tambah Nasabah
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
