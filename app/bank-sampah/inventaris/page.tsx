import { redirect } from "next/navigation"
import { getSession } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import Header from "@/components/header"
import InventarisTable from "@/components/inventaris-table"

export default async function InventarisPage() {
  const session = await getSession()

  if (!session || session.userType !== "bank-sampah") {
    redirect("/")
  }

  const inventaris = await prisma.inventarisSampah.findMany({
    where: { bankSampahId: session.userId },
    orderBy: { jenisSampah: "asc" },
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <Header userType="bank-sampah" />

      <main className="max-w-6xl mx-auto py-6 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Inventaris Sampah</h1>
          <p className="text-gray-600">Kelola jenis sampah dan harga per kilogram</p>
        </div>

        <InventarisTable inventaris={inventaris} />
      </main>
    </div>
  )
}
