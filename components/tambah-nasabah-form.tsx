"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { createNasabahAction } from "@/app/actions/nasabah-management"
import { UserPlus, Loader2 } from "lucide-react"

interface TambahNasabahFormProps {
  bankSampahId: string
}

export default function TambahNasabahForm({ bankSampahId }: TambahNasabahFormProps) {
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
        const form = document.getElementById("tambah-nasabah-form") as HTMLFormElement
        form?.reset()
      }
    } catch (error) {
      setMessage({ type: "error", text: "Terjadi kesalahan saat menambahkan nasabah" })
    } finally {
      setLoading(false)
      // Clear message after 3 seconds
      setTimeout(() => setMessage(null), 3000)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="h-5 w-5" />
          Tambah Nasabah Baru
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form id="tambah-nasabah-form" action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nama">Nama Lengkap</Label>
            <Input id="nama" name="nama" placeholder="Masukkan nama lengkap" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" placeholder="email@example.com" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" placeholder="Password untuk login" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="telepon">Telepon</Label>
            <Input id="telepon" name="telepon" placeholder="08xxxxxxxxxx" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="alamat">Alamat</Label>
            <Textarea id="alamat" name="alamat" placeholder="Alamat lengkap nasabah" rows={3} required />
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

          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Tambah Nasabah
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
