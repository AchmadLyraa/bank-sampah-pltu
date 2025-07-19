"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import type { PenimbanganFormData, PenarikanFormData } from "@/types"

export async function getDashboardData(bankSampahId: string) {
  const [nasabahCount, totalSaldo, inventaris, recentTransaksi] = await Promise.all([
    prisma.nasabah.count({ where: { bankSampahId } }),
    prisma.nasabah.aggregate({
      where: { bankSampahId },
      _sum: { saldo: true },
    }),
    prisma.inventarisSampah.findMany({
      where: { bankSampahId },
      orderBy: { jenisSampah: "asc" },
    }),
    prisma.transaksi.findMany({
      where: { bankSampahId },
      include: {
        nasabah: { select: { nama: true } },
        detailTransaksi: {
          include: {
            inventarisSampah: { select: { jenisSampah: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ])

  return {
    nasabahCount,
    totalSaldo: totalSaldo._sum.saldo || 0,
    inventaris,
    recentTransaksi,
  }
}

export async function updateInventarisAction(formData: FormData) {
  const id = formData.get("id") as string
  const hargaPerKg = Number.parseFloat(formData.get("hargaPerKg") as string)

  await prisma.inventarisSampah.update({
    where: { id },
    data: { hargaPerKg },
  })

  revalidatePath("/bank-sampah/inventaris")
  return { success: true }
}

export async function penimbanganAction(data: PenimbanganFormData) {
  const { nasabahId, items } = data

  // Calculate total
  let totalNilai = 0
  const detailItems = []

  for (const item of items) {
    const inventaris = await prisma.inventarisSampah.findUnique({
      where: { id: item.inventarisSampahId },
    })

    if (!inventaris) continue

    const subtotal = item.beratKg * inventaris.hargaPerKg
    totalNilai += subtotal

    detailItems.push({
      inventarisSampahId: item.inventarisSampahId,
      beratKg: item.beratKg,
      hargaPerKg: inventaris.hargaPerKg,
      subtotal,
    })
  }

  // Create transaction
  const nasabah = await prisma.nasabah.findUnique({ where: { id: nasabahId } })
  if (!nasabah) throw new Error("Nasabah tidak ditemukan")

  const transaksi = await prisma.transaksi.create({
    data: {
      jenis: "PEMASUKAN",
      totalNilai,
      keterangan: "Penjualan sampah",
      nasabahId,
      bankSampahId: nasabah.bankSampahId,
      detailTransaksi: {
        create: detailItems,
      },
    },
  })

  // Update nasabah saldo
  await prisma.nasabah.update({
    where: { id: nasabahId },
    data: { saldo: { increment: totalNilai } },
  })

  // Update inventaris stok
  for (const item of items) {
    await prisma.inventarisSampah.update({
      where: { id: item.inventarisSampahId },
      data: { stokKg: { increment: item.beratKg } },
    })
  }

  revalidatePath("/bank-sampah")
  revalidatePath("/bank-sampah/penimbangan")
  return { success: true, transaksiId: transaksi.id }
}

export async function penarikanAction(data: PenarikanFormData) {
  const { nasabahId, jumlah } = data

  const nasabah = await prisma.nasabah.findUnique({ where: { id: nasabahId } })
  if (!nasabah) throw new Error("Nasabah tidak ditemukan")
  if (nasabah.saldo < jumlah) throw new Error("Saldo tidak mencukupi")

  // Create transaction
  await prisma.transaksi.create({
    data: {
      jenis: "PENGELUARAN",
      totalNilai: jumlah,
      keterangan: "Penarikan saldo",
      nasabahId,
      bankSampahId: nasabah.bankSampahId,
    },
  })

  // Update nasabah saldo
  await prisma.nasabah.update({
    where: { id: nasabahId },
    data: { saldo: { decrement: jumlah } },
  })

  revalidatePath("/bank-sampah")
  return { success: true }
}

export async function penjualanSampahAction(formData: FormData) {
  const inventarisSampahId = formData.get("inventarisSampahId") as string
  const beratKg = Number.parseFloat(formData.get("beratKg") as string)
  const hargaJual = Number.parseFloat(formData.get("hargaJual") as string)

  const inventaris = await prisma.inventarisSampah.findUnique({
    where: { id: inventarisSampahId },
  })

  if (!inventaris) throw new Error("Inventaris tidak ditemukan")
  if (inventaris.stokKg < beratKg) throw new Error("Stok tidak mencukupi")

  const totalNilai = beratKg * hargaJual

  // Create transaction
  await prisma.transaksi.create({
    data: {
      jenis: "PENJUALAN_SAMPAH",
      totalNilai,
      keterangan: `Penjualan ${inventaris.jenisSampah} ${beratKg}kg`,
      nasabahId: "", // Empty for bank sampah transactions
      bankSampahId: inventaris.bankSampahId,
    },
  })

  // Update stok
  await prisma.inventarisSampah.update({
    where: { id: inventarisSampahId },
    data: { stokKg: { decrement: beratKg } },
  })

  revalidatePath("/bank-sampah")
  revalidatePath("/bank-sampah/inventaris")
  return { success: true }
}
