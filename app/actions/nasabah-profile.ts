"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import bcrypt from "bcryptjs"

export async function updateNasabahProfileAction(formData: FormData) {
  const nasabahId = formData.get("nasabahId") as string
  const alamat = formData.get("alamat") as string
  const telepon = formData.get("telepon") as string

  try {
    // Update alamat dan telepon
    await prisma.nasabah.update({
      where: { id: nasabahId },
      data: {
        alamat,
        telepon,
      },
    })

    revalidatePath("/nasabah")
    return { success: true, message: "Profil berhasil diperbarui!" }
  } catch (error) {
    console.error("Error updating profile:", error)
    return { error: "Terjadi kesalahan saat memperbarui profil" }
  }
}

export async function changeNasabahPasswordAction(formData: FormData) {
  const nasabahId = formData.get("nasabahId") as string
  const currentPassword = formData.get("currentPassword") as string
  const newPassword = formData.get("newPassword") as string
  const confirmPassword = formData.get("confirmPassword") as string

  try {
    // Validasi password baru
    if (newPassword !== confirmPassword) {
      return { error: "Password baru dan konfirmasi password tidak sama" }
    }

    if (newPassword.length < 6) {
      return { error: "Password baru minimal 6 karakter" }
    }

    // Cek password lama
    const nasabah = await prisma.nasabah.findUnique({
      where: { id: nasabahId },
    })

    if (!nasabah) {
      return { error: "Nasabah tidak ditemukan" }
    }

    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, nasabah.password)
    if (!isCurrentPasswordValid) {
      return { error: "Password lama tidak benar" }
    }

    // Hash password baru
    const hashedNewPassword = await bcrypt.hash(newPassword, 10)

    // Update password
    await prisma.nasabah.update({
      where: { id: nasabahId },
      data: {
        password: hashedNewPassword,
      },
    })

    revalidatePath("/nasabah")
    return { success: true, message: "Password berhasil diubah!" }
  } catch (error) {
    console.error("Error changing password:", error)
    return { error: "Terjadi kesalahan saat mengubah password" }
  }
}
