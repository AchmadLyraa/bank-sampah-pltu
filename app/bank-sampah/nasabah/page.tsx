import { redirect } from "next/navigation"
import { getSession } from "@/lib/session"
import { getNasabahList } from "@/app/actions/nasabah-management"
import LayoutWrapper from "@/components/layout-wrapper"
import NasabahListWithSearch from "@/components/nasabah-list-with-search"
import TambahNasabahModal from "@/components/tambah-nasabah-modal"

export default async function NasabahPage() {
  const session = await getSession()

  if (!session || session.userType !== "bank-sampah") {
    redirect("/")
  }

  const nasabahList = await getNasabahList(session.userId)

  return (
    <LayoutWrapper userType="bank-sampah">
      <div className="max-w-6xl mx-auto py-6 px-4">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Kelola Nasabah</h1>
            <p className="text-gray-600">Daftar nasabah dan tambah nasabah baru</p>
          </div>

          {/* Modal Trigger Button */}
          <TambahNasabahModal bankSampahId={session.userId} />
        </div>

        {/* List Nasabah with Search */}
        <NasabahListWithSearch nasabahList={nasabahList} />
      </div>
    </LayoutWrapper>
  )
}
