"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Users, Mail, Phone, MapPin, Wallet, Search } from "lucide-react"
import type { Nasabah } from "@/types"

interface NasabahListWithSearchProps {
  nasabahList: Nasabah[]
}

export default function NasabahListWithSearch({ nasabahList }: NasabahListWithSearchProps) {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredNasabah = useMemo(() => {
    if (!searchTerm) return nasabahList

    const term = searchTerm.toLowerCase()
    return nasabahList.filter(
      (nasabah) =>
        nasabah.nama.toLowerCase().includes(term) ||
        nasabah.email.toLowerCase().includes(term) ||
        nasabah.telepon.includes(term) ||
        nasabah.alamat.toLowerCase().includes(term),
    )
  }, [nasabahList, searchTerm])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Daftar Nasabah ({filteredNasabah.length})
        </CardTitle>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Cari nasabah (nama, email, telepon, alamat)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </CardHeader>
      <CardContent>
        {filteredNasabah.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            {searchTerm ? (
              <>
                <p>Tidak ada nasabah yang cocok dengan pencarian "{searchTerm}"</p>
                <p className="text-sm">Coba kata kunci lain atau hapus filter pencarian</p>
              </>
            ) : (
              <>
                <p>Belum ada nasabah terdaftar</p>
                <p className="text-sm">Tambahkan nasabah pertama menggunakan tombol "Tambah Nasabah"</p>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredNasabah.map((nasabah) => (
              <div key={nasabah.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between mb-3 flex-wrap sm:flex-row flex-col">
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900">{nasabah.nama}</h3>
                    <div className="flex sm:items-center items-start sm:gap-4 gap-0 sm:flex-row flex-col text-sm text-gray-600 mt-1">
                      <span className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {nasabah.email}
                      </span>
                      <span className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {nasabah.telepon}
                      </span>
                    </div>
                  </div>
                  <div className="sm:text-right text-left sm:flex-none flex-[100]">
                    <div className="flex items-center sm:justify-end justify-normal gap-1 text-green-600 font-semibold">
                      <Wallet className="h-4 w-4" />
                      Rp {nasabah.saldo.toLocaleString()}
                    </div>
                    <Badge variant={nasabah.saldo > 0 ? "default" : "secondary"} className="mt-1">
                      {nasabah.saldo > 0 ? "Ada Saldo" : "Saldo Kosong"}
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <MapPin className="h-3 w-3" />
                  {nasabah.alamat}
                </div>

                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Bergabung: {new Date(nasabah.createdAt).toLocaleDateString("id-ID")}</span>
                    <span>Update: {new Date(nasabah.updatedAt).toLocaleDateString("id-ID")}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
