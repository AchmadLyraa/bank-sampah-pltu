import bcrypt from "bcrypt"
import { prisma } from "./prisma"

// Update authenticateUser function to automatically detect user type
export async function authenticateUser(data: { email: string; password: string }) {
  const { email, password } = data

  try {
    // First, try to find in bank sampah
    const bankSampah = await prisma.bankSampah.findUnique({
      where: { email },
    })

    if (bankSampah) {
      const isValid = await bcrypt.compare(password, bankSampah.password)
      if (isValid) {
        return { type: "bank-sampah", user: bankSampah }
      }
    }

    // If not found in bank sampah, try nasabah
    const nasabah = await prisma.nasabah.findUnique({
      where: { email },
    })

    if (nasabah) {
      const isValid = await bcrypt.compare(password, nasabah.password)
      if (isValid) {
        return { type: "nasabah", user: nasabah }
      }
    }

    // If neither found or password invalid
    return null
  } catch (error) {
    console.error("Authentication error:", error)
    return null
  }
}
