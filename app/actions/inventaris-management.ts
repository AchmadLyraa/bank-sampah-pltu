"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function createInventarisAction(formData: FormData) {
  const jenisSampah = formData.get("jenisSampah") as string
  const hargaPerKg = Number.parseFloat(formData.get("hargaPerKg") as string)
  const bankSampahId = formData.get("bankSampahId") as string

  try {
    // Check if jenis sampah already exists for this bank sampah
    const existingInventaris = await prisma.inventarisSampah.findFirst({
      where: {
        jenisSampah: {
          equals: jenisSampah,
          mode: "insensitive",
        },
        bankSampahId,
      },
    })

    if (existingInventaris) {
      return { error: "Jenis sampah sudah ada dalam inventaris" }
    }

    // Create inventaris
    await prisma.inventarisSampah.create({
      data: {
        jenisSampah,
        hargaPerKg,
        stokKg: 0,
        isActive: true, // 🆕 Default active
        bankSampahId,
      },
    })

    revalidatePath("/bank-sampah/inventaris")
    return { success: true }
  } catch (error) {
    console.error("Error creating inventaris:", error)
    return { error: "Terjadi kesalahan saat menambahkan jenis sampah" }
  }
}

export async function deleteInventarisAction(formData: FormData) {
  const id = formData.get("id") as string

  try {
    // Check if inventaris exists and has zero stock
    const inventaris = await prisma.inventarisSampah.findUnique({
      where: { id },
    })

    if (!inventaris) {
      return { error: "Inventaris tidak ditemukan" }
    }

    if (inventaris.stokKg > 0) {
      return { error: "Tidak dapat menghapus jenis sampah yang masih memiliki stok" }
    }

    // Check if there are any detail transaksi related to this inventaris
    const relatedTransaksi = await prisma.detailTransaksi.findFirst({
      where: { inventarisSampahId: id },
    })

    if (relatedTransaksi) {
      return { error: "Tidak dapat menghapus jenis sampah yang sudah memiliki riwayat transaksi" }
    }

    // Delete inventaris
    await prisma.inventarisSampah.delete({
      where: { id },
    })

    revalidatePath("/bank-sampah/inventaris")
    return { success: true }
  } catch (error) {
    console.error("Error deleting inventaris:", error)
    return { error: "Terjadi kesalahan saat menghapus jenis sampah" }
  }
}

// 🆕 NEW: Toggle active/inactive status
export async function toggleInventarisStatusAction(formData: FormData) {
  const id = formData.get("id") as string
  const isActive = formData.get("isActive") === "true"

  try {
    await prisma.inventarisSampah.update({
      where: { id },
      data: { isActive: !isActive }, // Toggle status
    })

    revalidatePath("/bank-sampah/inventaris")
    revalidatePath("/bank-sampah/penimbangan") // Refresh penimbangan page too
    return { success: true }
  } catch (error) {
    console.error("Error toggling inventaris status:", error)
    return { error: "Terjadi kesalahan saat mengubah status" }
  }
}
