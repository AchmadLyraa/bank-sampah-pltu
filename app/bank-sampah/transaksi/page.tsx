import { redirect } from "next/navigation"
import { getSession } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import TransaksiTable from "@/components/transaksi-table"
import LayoutWrapper from "@/components/layout-wrapper"

interface TransaksiPageProps {
  searchParams: { page?: string }
}

export default async function TransaksiPage({ searchParams }: TransaksiPageProps) {
  const session = await getSession()

  if (!session || session.userType !== "bank-sampah") {
    redirect("/")
  }

  // 📄 Pagination setup
  const currentPage = Number(searchParams.page) || 1
  const itemsPerPage = 20
  const skip = (currentPage - 1) * itemsPerPage

  // 📊 Get total count for pagination
  const totalTransaksi = await prisma.transaksi.count({
    where: { bankSampahId: session.userId },
  })

  const totalPages = Math.ceil(totalTransaksi / itemsPerPage)

  // 📋 Get paginated transaksi
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
    skip,
    take: itemsPerPage,
  })

  return (
    <LayoutWrapper userType="bank-sampah">
      <div className="max-w-7xl mx-auto py-6 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Riwayat Transaksi</h1>
          <p className="text-gray-600">Semua transaksi bank sampah</p>
        </div>

        <TransaksiTable
          transaksi={transaksi}
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalTransaksi}
        />
      </div>
    </LayoutWrapper>
  )
}
