import { redirect } from "next/navigation"
import { getSession } from "@/lib/session"
import LoginForm from "@/components/login-form"

export default async function HomePage() {
  const session = await getSession()

  if (session) {
    if (session.userType === "bank-sampah") {
      redirect("/bank-sampah")
    } else {
      redirect("/nasabah")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Bank Sampah</h1>
          <p className="text-gray-600">Sistem Manajemen Bank Sampah</p>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}
