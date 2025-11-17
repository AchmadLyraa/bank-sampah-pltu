import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { execSync } from "child_process";

const prisma = new PrismaClient();

async function main() {
  // console.log("🔄 Reset database...");
  // execSync("npx prisma db push --force-reset", { stdio: "inherit" });
  // console.log("✅ Database reset.\n");

  console.log("🌱 Seeding (Single Bank Mode)...");

  // Controller
  const hashedControllerPassword = await bcrypt.hash("k4lt1mt3luk", 10);
  const controller = await prisma.controller.upsert({
    where: { email: "admin@controller.com" },
    update: { password: hashedControllerPassword },
    create: {
      nama: "Super Admin Controller",
      email: "admin@controller.com",
      password: hashedControllerPassword,
    },
  });
  console.log("✅ Controller created/updated");

  // Only one Bank Sampah
  const hashedBankPassword = await bcrypt.hash("password123", 10);

  const bank = await prisma.bankSampah.upsert({
    where: { email: "admin@banksampah.com" },
    update: {},
    create: {
      nama: "Bank Sampah Hijau Lestari",
      alamat: "Jl. Lingkungan No. 123, Bogor",
      telepon: "0251-1234567",
      email: "admin@banksampah.com",
      password: hashedBankPassword,
      longitude: -6.5971,
      latitude: 106.806,
      isActive: true,
      role: "BANK_SAMPAH",
    },
  });
  console.log(`✅ Bank Sampah created: ${bank.nama}`);

  // Inventaris template
  const inventarisTemplate = [
    { jenisSampah: "Plastik Botol", hargaPerUnit: 2000, satuan: "KG" },
    { jenisSampah: "Plastik Kemasan", hargaPerUnit: 1500, satuan: "KG" },
    { jenisSampah: "Kertas Koran", hargaPerUnit: 1000, satuan: "KG" },
    { jenisSampah: "Kertas Kardus", hargaPerUnit: 1200, satuan: "KG" },
    { jenisSampah: "Kaleng Aluminum", hargaPerUnit: 15000, satuan: "KG" },
    { jenisSampah: "Besi", hargaPerUnit: 3000, satuan: "KG" },
    { jenisSampah: "Botol Kaca", hargaPerUnit: 800, satuan: "KG" },
    { jenisSampah: "Plastik PP", hargaPerUnit: 2200, satuan: "KG" },
  ];

  for (const item of inventarisTemplate) {
    await prisma.inventarisSampah.upsert({
      where: {
        bankSampahId_jenisSampah_satuan: {
          bankSampahId: bank.id,
          jenisSampah: item.jenisSampah,
          satuan: "KG",
        },
      },
      update: {},
      create: {
        jenisSampah: item.jenisSampah,
        hargaPerUnit: item.hargaPerUnit,
        stokUnit: 0,
        satuan: "KG",
        isActive: true,
        bankSampahId: bank.id,
      },
    });
  }
  console.log("✅ Inventaris created");

  // Only create persons and register ONLY to this bank
  const personData = [
    {
      nama: "Budi Santoso",
      nik: "1234567890123456",
      alamat: "Jl. Mawar No. 45, Bogor",
      telepon: "081234567890",
      email: "budi@email.com",
    },
    {
      nama: "Siti Nurhaliza",
      nik: "1234567890123457",
      alamat: "Jl. Melati No. 67, Jakarta",
      telepon: "081234567891",
      email: "siti@email.com",
    },
    {
      nama: "Ahmad Wijaya",
      nik: "1234567890123458",
      alamat: "Jl. Anggrek No. 89, Bandung",
      telepon: "081234567892",
      email: "ahmad@email.com",
    },
  ];

  const allNasabah = [];

  for (const p of personData) {
    const person = await prisma.person.upsert({
      where: { email: p.email },
      update: {},
      create: {
        nama: p.nama,
        nik: p.nik,
        alamat: p.alamat,
        telepon: p.telepon,
        email: p.email,
        password: hashedBankPassword,
      },
    });

    const nasabah = await prisma.nasabah.create({
      data: {
        personId: person.id,
        bankSampahId: bank.id,
        saldo: 0,
        isActive: true,
      },
    });

    allNasabah.push({ person, nasabah });
  }

  console.log(`✅ Total Person: ${personData.length}`);
  console.log(`✅ Total Nasabah: ${allNasabah.length}`);

  // Sample 1 Transaction
  const invBotol = await prisma.inventarisSampah.findFirst({
    where: { bankSampahId: bank.id, jenisSampah: "Plastik Botol" },
  });

  const nasabahBudi = allNasabah.find(
    (x) => x.person.email === "budi@email.com",
  )!.nasabah;

  const total = 2 * (invBotol?.hargaPerUnit ?? 0);

  await prisma.transaksi.create({
    data: {
      jenis: "PEMASUKAN",
      totalNilai: total,
      keterangan: "Penjualan sampah plastik botol",
      nasabahId: nasabahBudi.id,
      bankSampahId: bank.id,
      detailTransaksi: {
        create: [
          {
            inventarisSampahId: invBotol!.id,
            jumlahUnit: 2,
            hargaPerUnit: invBotol!.hargaPerUnit,
            subtotal: total,
          },
        ],
      },
    },
  });

  await prisma.nasabah.update({
    where: { id: nasabahBudi.id },
    data: { saldo: { increment: total } },
  });

  await prisma.inventarisSampah.update({
    where: { id: invBotol!.id },
    data: { stokUnit: { increment: 2 } },
  });

  console.log("✅ Sample transaksi created");
  console.log("🎉 Single-Bank Seeding completed!\n");

  console.log("LOGIN:");
  console.log(`Controller: ${controller.email} / k4lt1mt3luk`);
  console.log(`Bank Admin: admin@banksampah.com / password123`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
