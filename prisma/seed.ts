import { PrismaClient } from "@prisma/client"
import bcrypt from "bcrypt"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Seeding database...")

  // Hash password untuk demo
  const hashedPassword = await bcrypt.hash("password123", 10)

  // Buat Bank Sampah
  const bankSampah = await prisma.bankSampah.create({
    data: {
      nama: "Bank Sampah Hijau Lestari",
      alamat: "Jl. Lingkungan No. 123, Bogor",
      telepon: "0251-1234567",
      email: "admin@banksampah.com",
      password: hashedPassword,
    },
  })

  console.log("✅ Bank Sampah created:", bankSampah.nama)

  // Buat Inventaris Sampah
  const inventarisSampah = await prisma.inventarisSampah.createMany({
    data: [
      {
        jenisSampah: "Plastik Botol",
        hargaPerKg: 2000,
        stokKg: 0,
        bankSampahId: bankSampah.id,
      },
      {
        jenisSampah: "Plastik Kemasan",
        hargaPerKg: 1500,
        stokKg: 0,
        bankSampahId: bankSampah.id,
      },
      {
        jenisSampah: "Kertas Koran",
        hargaPerKg: 1000,
        stokKg: 0,
        bankSampahId: bankSampah.id,
      },
      {
        jenisSampah: "Kertas Kardus",
        hargaPerKg: 1200,
        stokKg: 0,
        bankSampahId: bankSampah.id,
      },
      {
        jenisSampah: "Kaleng Aluminum",
        hargaPerKg: 15000,
        stokKg: 0,
        bankSampahId: bankSampah.id,
      },
      {
        jenisSampah: "Besi",
        hargaPerKg: 3000,
        stokKg: 0,
        bankSampahId: bankSampah.id,
      },
    ],
  })

  console.log("✅ Inventaris Sampah created:", inventarisSampah.count, "items")

  // Buat Nasabah
  const nasabahData = [
    {
      nama: "Budi Santoso",
      alamat: "Jl. Mawar No. 45, Bogor",
      telepon: "081234567890",
      email: "budi@email.com",
      password: hashedPassword,
      saldo: 0,
      bankSampahId: bankSampah.id,
    },
    {
      nama: "Siti Nurhaliza",
      alamat: "Jl. Melati No. 67, Bogor",
      telepon: "081234567891",
      email: "siti@email.com",
      password: hashedPassword,
      saldo: 0,
      bankSampahId: bankSampah.id,
    },
    {
      nama: "Ahmad Wijaya",
      alamat: "Jl. Anggrek No. 89, Bogor",
      telepon: "081234567892",
      email: "ahmad@email.com",
      password: hashedPassword,
      saldo: 0,
      bankSampahId: bankSampah.id,
    },
    {
      nama: "Dewi Sartika",
      alamat: "Jl. Dahlia No. 12, Bogor",
      telepon: "081234567893",
      email: "dewi@email.com",
      password: hashedPassword,
      saldo: 0,
      bankSampahId: bankSampah.id,
    },
    {
      nama: "Rudi Hartono",
      alamat: "Jl. Kenanga No. 34, Bogor",
      telepon: "081234567894",
      email: "rudi@email.com",
      password: hashedPassword,
      saldo: 0,
      bankSampahId: bankSampah.id,
    },
  ]

  for (const nasabah of nasabahData) {
    await prisma.nasabah.create({
      data: nasabah,
    })
  }

  console.log("✅ Nasabah created:", nasabahData.length, "nasabah")

  // Buat beberapa transaksi sample untuk demo
  const nasabahList = await prisma.nasabah.findMany()
  const inventarisList = await prisma.inventarisSampah.findMany()

  // Sample transaksi: Budi jual plastik botol 2kg
  const transaksi1 = await prisma.transaksi.create({
    data: {
      jenis: "PEMASUKAN",
      totalNilai: 4000, // 2kg x 2000
      keterangan: "Penjualan sampah plastik botol",
      nasabahId: nasabahList[0].id,
      bankSampahId: bankSampah.id,
    },
  })

  await prisma.detailTransaksi.create({
    data: {
      transaksiId: transaksi1.id,
      inventarisSampahId: inventarisList[0].id, // Plastik Botol
      beratKg: 2,
      hargaPerKg: 2000,
      subtotal: 4000,
    },
  })

  // Update saldo nasabah dan stok sampah
  await prisma.nasabah.update({
    where: { id: nasabahList[0].id },
    data: { saldo: { increment: 4000 } },
  })

  await prisma.inventarisSampah.update({
    where: { id: inventarisList[0].id },
    data: { stokKg: { increment: 2 } },
  })

  // Sample transaksi: Siti jual kertas kardus 3kg
  const transaksi2 = await prisma.transaksi.create({
    data: {
      jenis: "PEMASUKAN",
      totalNilai: 3600, // 3kg x 1200
      keterangan: "Penjualan sampah kertas kardus",
      nasabahId: nasabahList[1].id,
      bankSampahId: bankSampah.id,
    },
  })

  await prisma.detailTransaksi.create({
    data: {
      transaksiId: transaksi2.id,
      inventarisSampahId: inventarisList[3].id, // Kertas Kardus
      beratKg: 3,
      hargaPerKg: 1200,
      subtotal: 3600,
    },
  })

  // Update saldo nasabah dan stok sampah
  await prisma.nasabah.update({
    where: { id: nasabahList[1].id },
    data: { saldo: { increment: 3600 } },
  })

  await prisma.inventarisSampah.update({
    where: { id: inventarisList[3].id },
    data: { stokKg: { increment: 3 } },
  })

  // Sample transaksi penarikan: Budi tarik saldo 2000
  const transaksi3 = await prisma.transaksi.create({
    data: {
      jenis: "PENGELUARAN",
      totalNilai: 2000,
      keterangan: "Penarikan saldo",
      nasabahId: nasabahList[0].id,
      bankSampahId: bankSampah.id,
    },
  })

  // Update saldo nasabah
  await prisma.nasabah.update({
    where: { id: nasabahList[0].id },
    data: { saldo: { decrement: 2000 } },
  })

  console.log("✅ Sample transaksi created")
  console.log("🎉 Seeding completed!")
  console.log("📊 Summary:")
  console.log(`   - Bank Sampah: ${bankSampah.nama}`)
  console.log(`   - Email: ${bankSampah.email}`)
  console.log(`   - Password: password123`)
  console.log(`   - Nasabah: ${nasabahData.length} orang`)
  console.log(`   - Inventaris: ${inventarisSampah.count} jenis sampah`)
  console.log(`   - Login nasabah: gunakan email dan password: password123`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
