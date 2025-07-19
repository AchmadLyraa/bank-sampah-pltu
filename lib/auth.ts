import bcrypt from "bcrypt"
import { prisma } from "./prisma"
import type { LoginFormData } from "@/types"

export async function authenticateUser(data: LoginFormData) {
  const { email, password, userType } = data

  try {
    if (userType === "bank-sampah") {
      const bankSampah = await prisma.bankSampah.findUnique({
        where: { email },
      })

      if (!bankSampah) return null

      const isValid = await bcrypt.compare(password, bankSampah.password)
      if (!isValid) return null

      return { type: "bank-sampah", user: bankSampah }
    } else {
      const nasabah = await prisma.nasabah.findUnique({
        where: { email },
      })

      if (!nasabah) return null

      const isValid = await bcrypt.compare(password, nasabah.password)
      if (!isValid) return null

      return { type: "nasabah", user: nasabah }
    }
  } catch (error) {
    console.error("Authentication error:", error)
    return null
  }
}
