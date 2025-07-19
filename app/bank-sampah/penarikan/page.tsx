import { redirect } from "next/navigation"
import { getSession } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import PenarikanForm from "@/components/penarikan-form"
import LayoutWrapper from "@/components/layout-wrapper"

export default async function PenarikanPage() {
  const session = await getSession()

  if (!session || session.userType !== "bank-sampah") {
    redirect("/")
  }

  const nasabahList = await prisma.nasabah.findMany({
    where: {
      bankSampahId: session.userId,
      saldo: { gt: 0 },
    },
    orderBy: { nama: "asc" },
  })

  return (
    <LayoutWrapper userType="bank-sampah">
      <div className="max-w-4xl mx-auto py-6 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Penarikan Saldo</h1>
          <p className="text-gray-600">Proses penarikan saldo nasabah</p>
        </div>

        <PenarikanForm nasabahList={nasabahList} />
      </div>
    </LayoutWrapper>
  )
}
