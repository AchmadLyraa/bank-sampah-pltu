"use server"

import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { authenticateUser } from "@/lib/auth"

// Update loginAction to remove userType parameter
export async function loginAction(formData: FormData) {
  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  }

  const result = await authenticateUser(data)

  if (!result) {
    return { error: "Email atau password salah" }
  }

  // Set session cookie
  const cookieStore = await cookies()
  cookieStore.set(
    "session",
    JSON.stringify({
      userId: result.user.id,
      userType: result.type,
      email: result.user.email,
      nama: result.user.nama,
    }),
    {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    },
  )

  // Redirect based on user type
  if (result.type === "bank-sampah") {
    redirect("/bank-sampah")
  } else {
    redirect("/nasabah")
  }
}

export async function logoutAction() {
  const cookieStore = await cookies()
  cookieStore.delete("session")
  redirect("/")
}
