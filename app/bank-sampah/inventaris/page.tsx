import { redirect } from "next/navigation"
import { getSession } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import InventarisTable from "@/components/inventaris-table"
import TambahInventarisModal from "@/components/tambah-inventaris-modal"
import LayoutWrapper from "@/components/layout-wrapper"

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
    <LayoutWrapper userType="bank-sampah">
      <div className="max-w-6xl mx-auto py-6 px-4">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Inventaris Sampah</h1>
            <p className="text-gray-600">Kelola jenis sampah dan harga per kilogram</p>
          </div>

          {/* Modal Trigger Button */}
          <TambahInventarisModal bankSampahId={session.userId} />
        </div>

        <InventarisTable inventaris={inventaris} />
      </div>
    </LayoutWrapper>
  )
}
