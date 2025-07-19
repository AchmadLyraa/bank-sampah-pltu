import { redirect } from "next/navigation"
import { getSession } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import Header from "@/components/header"
import TransaksiTable from "@/components/transaksi-table"

export default async function TransaksiPage() {
  const session = await getSession()

  if (!session || session.userType !== "bank-sampah") {
    redirect("/")
  }

  const transaksi = await prisma.transaksi.findMany({
    where: { bankSampahId: session.userId },
    include: {
      nasabah: { select: { nama: true } },
      detailTransaksi: {
        include: {
          inventarisSampah: { select: { jenisSampah: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <Header userType="bank-sampah" />

      <main className="max-w-7xl mx-auto py-6 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Riwayat Transaksi</h1>
          <p className="text-gray-600">Semua transaksi bank sampah</p>
        </div>

        <TransaksiTable transaksi={transaksi} />
      </main>
    </div>
  )
}
