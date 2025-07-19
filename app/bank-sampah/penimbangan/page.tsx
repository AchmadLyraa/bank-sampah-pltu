import { redirect } from "next/navigation"
import { getSession } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import Header from "@/components/header"
import PenimbanganForm from "@/components/penimbangan-form"

export default async function PenimbanganPage() {
  const session = await getSession()

  if (!session || session.userType !== "bank-sampah") {
    redirect("/")
  }

  const [nasabahList, inventarisList] = await Promise.all([
    prisma.nasabah.findMany({
      where: { bankSampahId: session.userId },
      orderBy: { nama: "asc" },
    }),
    prisma.inventarisSampah.findMany({
      where: { bankSampahId: session.userId },
      orderBy: { jenisSampah: "asc" },
    }),
  ])

  return (
    <div className="min-h-screen bg-gray-50">
      <Header userType="bank-sampah" />

      <main className="max-w-4xl mx-auto py-6 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Penimbangan Sampah</h1>
          <p className="text-gray-600">Catat penjualan sampah dari nasabah</p>
        </div>

        <PenimbanganForm nasabahList={nasabahList} inventarisList={inventarisList} />
      </main>
    </div>
  )
}
