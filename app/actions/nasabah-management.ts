"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import bcrypt from "bcrypt"

export async function getNasabahList(bankSampahId: string) {
  const nasabahList = await prisma.nasabah.findMany({
    where: { bankSampahId },
    orderBy: { nama: "asc" },
  })

  return nasabahList
}

export async function createNasabahAction(formData: FormData) {
  const nama = formData.get("nama") as string
  const alamat = formData.get("alamat") as string
  const telepon = formData.get("telepon") as string
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const bankSampahId = formData.get("bankSampahId") as string

  try {
    // Check if email already exists
    const existingNasabah = await prisma.nasabah.findUnique({
      where: { email },
    })

    if (existingNasabah) {
      return { error: "Email sudah digunakan" }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create nasabah
    await prisma.nasabah.create({
      data: {
        nama,
        alamat,
        telepon,
        email,
        password: hashedPassword,
        saldo: 0,
        bankSampahId,
      },
    })

    revalidatePath("/bank-sampah/nasabah")
    return { success: true }
  } catch (error) {
    console.error("Error creating nasabah:", error)
    return { error: "Terjadi kesalahan saat membuat akun nasabah" }
  }
}
