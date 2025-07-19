import { redirect } from "next/navigation"
import { getSession } from "@/lib/session"
import { getNasabahData } from "@/app/actions/nasabah"
import Header from "@/components/header"
import NasabahDashboard from "@/components/nasabah-dashboard"

export default async function NasabahPage() {
  const session = await getSession()

  if (!session || session.userType !== "nasabah") {
    redirect("/")
  }

  const data = await getNasabahData(session.userId)

  return (
    <div className="min-h-screen bg-gray-50">
      <Header userType="nasabah" />

      <main className="max-w-4xl mx-auto py-6 px-4">
        <NasabahDashboard data={data} />
      </main>
    </div>
  )
}
