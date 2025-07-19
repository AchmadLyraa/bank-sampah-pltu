import { redirect } from "next/navigation"
import { getSession } from "@/lib/session"
import { getNasabahData } from "@/app/actions/nasabah"
import LayoutWrapper from "@/components/layout-wrapper"
import NasabahDashboard from "@/components/nasabah-dashboard"

export default async function NasabahPage() {
  const session = await getSession()

  if (!session || session.userType !== "nasabah") {
    redirect("/")
  }

  const data = await getNasabahData(session.userId)

  return (
    <LayoutWrapper userType="nasabah">
      <div className="max-w-4xl mx-auto py-6 px-4">
        <NasabahDashboard data={data} />
      </div>
    </LayoutWrapper>
  )
}
