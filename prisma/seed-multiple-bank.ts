import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database with multiple bank sampah...");

  // Hash password untuk demo
  const hashedPassword = await bcrypt.hash("password123", 10);

  // 🏢 Buat Bank Sampah Pertama (yang sudah ada)
  const bankSampah1 = await prisma.bankSampah.upsert({
    where: { email: "admin@banksampah.com" },
    update: {},
    create: {
      nama: "Bank Sampah Hijau Lestari",
      alamat: "Jl. Lingkungan No. 123, Bogor",
      telepon: "0251-1234567",
      email: "admin@banksampah.com",
      password: hashedPassword,
    },
  });

  // 🏢 Buat Bank Sampah Kedua
  const bankSampah2 = await prisma.bankSampah.upsert({
    where: { email: "admin@banksampahbersih.com" },
    update: {},
    create: {
      nama: "Bank Sampah Bersih Sejahtera",
      alamat: "Jl. Kebersihan No. 456, Jakarta",
      telepon: "021-9876543",
      email: "admin@banksampahbersih.com",
      password: hashedPassword,
    },
  });

  // 🏢 Buat Bank Sampah Ketiga
  const bankSampah3 = await prisma.bankSampah.upsert({
    where: { email: "admin@banksampahcerdas.com" },
    update: {},
    create: {
      nama: "Bank Sampah Cerdas Mandiri",
      alamat: "Jl. Inovasi No. 789, Bandung",
      telepon: "022-5555666",
      email: "admin@banksampahcerdas.com",
      password: hashedPassword,
    },
  });

  console.log("✅ Bank Sampah created:");
  console.log(`   1. ${bankSampah1.nama}`);
  console.log(`   2. ${bankSampah2.nama}`);
  console.log(`   3. ${bankSampah3.nama}`);

  // 📦 Buat Inventaris untuk semua Bank Sampah
  const inventarisTemplate = [
    { jenisSampah: "Plastik Botol", hargaPerKg: 2000 },
    { jenisSampah: "Plastik Kemasan", hargaPerKg: 1500 },
    { jenisSampah: "Kertas Koran", hargaPerKg: 1000 },
    { jenisSampah: "Kertas Kardus", hargaPerKg: 1200 },
    { jenisSampah: "Kaleng Aluminum", hargaPerKg: 15000 },
    { jenisSampah: "Besi", hargaPerKg: 3000 },
    { jenisSampah: "Botol Kaca", hargaPerKg: 800 },
    { jenisSampah: "Plastik PP", hargaPerKg: 2200 },
  ];

  const bankSampahs = [bankSampah1, bankSampah2, bankSampah3];

  for (const bankSampah of bankSampahs) {
    // Variasi harga sedikit untuk setiap bank sampah
    const priceMultiplier =
      bankSampah.id === bankSampah1.id
        ? 1
        : bankSampah.id === bankSampah2.id
          ? 1.1
          : 1.05;

    for (const template of inventarisTemplate) {
      await prisma.inventarisSampah.upsert({
        where: {
          bankSampahId_jenisSampah: {
            bankSampahId: bankSampah.id,
            jenisSampah: template.jenisSampah,
          },
        },
        update: {},
        create: {
          jenisSampah: template.jenisSampah,
          hargaPerKg: Math.round(template.hargaPerKg * priceMultiplier),
          stokKg: 0,
          isActive: true,
          bankSampahId: bankSampah.id,
        },
      });
    }
  }

  console.log("✅ Inventaris created for all bank sampah");

  // 👥 Buat Person (individu) - beberapa akan terdaftar di multiple bank
  const personData = [
    {
      nama: "Budi Santoso",
      nik: "1234567890123456",
      alamat: "Jl. Mawar No. 45, Bogor",
      telepon: "081234567890",
      email: "budi@email.com",
      registerAt: [bankSampah1.id, bankSampah2.id], // 🎯 Terdaftar di 2 bank
    },
    {
      nama: "Siti Nurhaliza",
      nik: "1234567890123457",
      alamat: "Jl. Melati No. 67, Jakarta",
      telepon: "081234567891",
      email: "siti@email.com",
      registerAt: [bankSampah1.id, bankSampah3.id], // 🎯 Terdaftar di 2 bank
    },
    {
      nama: "Ahmad Wijaya",
      nik: "1234567890123458",
      alamat: "Jl. Anggrek No. 89, Bandung",
      telepon: "081234567892",
      email: "ahmad@email.com",
      registerAt: [bankSampah1.id, bankSampah2.id, bankSampah3.id], // 🎯 Terdaftar di 3 bank
    },
    {
      nama: "Dewi Sartika",
      nik: "1234567890123459",
      alamat: "Jl. Dahlia No. 12, Jakarta",
      telepon: "081234567893",
      email: "dewi@email.com",
      registerAt: [bankSampah2.id], // Hanya di bank sampah 2
    },
    {
      nama: "Rudi Hartono",
      nik: "1234567890123460",
      alamat: "Jl. Kenanga No. 34, Bandung",
      telepon: "081234567894",
      email: "rudi@email.com",
      registerAt: [bankSampah3.id], // Hanya di bank sampah 3
    },
    {
      nama: "Maya Sari",
      nik: "1234567890123461",
      alamat: "Jl. Cempaka No. 56, Jakarta",
      telepon: "081234567895",
      email: "maya@email.com",
      registerAt: [bankSampah2.id, bankSampah3.id], // 🎯 Terdaftar di 2 bank
    },
    {
      nama: "Andi Pratama",
      nik: "1234567890123462",
      alamat: "Jl. Flamboyan No. 78, Bogor",
      telepon: "081234567896",
      email: "andi@email.com",
      registerAt: [bankSampah1.id], // Hanya di bank sampah 1
    },
  ];

  // 🔄 Buat Person dan Nasabah relationships
  const allNasabahRelationships = [];

  for (const data of personData) {
    // 1. Buat atau update Person
    const person = await prisma.person.upsert({
      where: { email: data.email },
      update: {
        nama: data.nama,
        alamat: data.alamat,
        telepon: data.telepon,
      },
      create: {
        nama: data.nama,
        nik: data.nik,
        alamat: data.alamat,
        telepon: data.telepon,
        email: data.email,
        password: hashedPassword,
      },
    });

    // 2. Buat Nasabah relationship di setiap bank yang dipilih
    for (const bankSampahId of data.registerAt) {
      const nasabahRelationship = await prisma.nasabah.upsert({
        where: {
          personId_bankSampahId: {
            personId: person.id,
            bankSampahId: bankSampahId,
          },
        },
        update: {},
        create: {
          personId: person.id,
          bankSampahId: bankSampahId,
          saldo: 0,
          isActive: true,
        },
      });

      allNasabahRelationships.push({
        relationship: nasabahRelationship,
        person: person,
        bankSampahId: bankSampahId,
      });

      const bankName = bankSampahs.find((b) => b.id === bankSampahId)?.nama;
      console.log(`✅ ${person.nama} terdaftar di: ${bankName}`);
    }
  }

  console.log(
    `✅ Total nasabah relationships: ${allNasabahRelationships.length}`,
  );

  // 📊 Buat sample transaksi untuk demonstrasi
  const inventarisList1 = await prisma.inventarisSampah.findMany({
    where: { bankSampahId: bankSampah1.id },
  });
  const inventarisList2 = await prisma.inventarisSampah.findMany({
    where: { bankSampahId: bankSampah2.id },
  });

  // Budi jual plastik botol di Bank Sampah 1
  const budiAtBank1 = allNasabahRelationships.find(
    (r) =>
      r.person.email === "budi@email.com" && r.bankSampahId === bankSampah1.id,
  );

  if (budiAtBank1) {
    const transaksi1 = await prisma.transaksi.create({
      data: {
        jenis: "PEMASUKAN",
        totalNilai: 4000,
        keterangan: "Penjualan sampah plastik botol",
        nasabahId: budiAtBank1.relationship.id,
        bankSampahId: bankSampah1.id,
      },
    });

    await prisma.detailTransaksi.create({
      data: {
        transaksiId: transaksi1.id,
        inventarisSampahId: inventarisList1[0].id,
        beratKg: 2,
        hargaPerKg: 2000,
        subtotal: 4000,
      },
    });

    await prisma.nasabah.update({
      where: { id: budiAtBank1.relationship.id },
      data: { saldo: { increment: 4000 } },
    });

    await prisma.inventarisSampah.update({
      where: { id: inventarisList1[0].id },
      data: { stokKg: { increment: 2 } },
    });

    console.log("✅ Budi transaksi di Bank Sampah 1");
  }

  // Budi jual kertas kardus di Bank Sampah 2 (nasabah yang sama, bank berbeda)
  const budiAtBank2 = allNasabahRelationships.find(
    (r) =>
      r.person.email === "budi@email.com" && r.bankSampahId === bankSampah2.id,
  );

  if (budiAtBank2) {
    const transaksi2 = await prisma.transaksi.create({
      data: {
        jenis: "PEMASUKAN",
        totalNilai: 3600,
        keterangan: "Penjualan sampah kertas kardus",
        nasabahId: budiAtBank2.relationship.id,
        bankSampahId: bankSampah2.id,
      },
    });

    await prisma.detailTransaksi.create({
      data: {
        transaksiId: transaksi2.id,
        inventarisSampahId: inventarisList2[3].id, // Kertas Kardus
        beratKg: 3,
        hargaPerKg: 1200,
        subtotal: 3600,
      },
    });

    await prisma.nasabah.update({
      where: { id: budiAtBank2.relationship.id },
      data: { saldo: { increment: 3600 } },
    });

    await prisma.inventarisSampah.update({
      where: { id: inventarisList2[3].id },
      data: { stokKg: { increment: 3 } },
    });

    console.log("✅ Budi transaksi di Bank Sampah 2");
  }

  // Ahmad transaksi di Bank Sampah 3
  const ahmadAtBank3 = allNasabahRelationships.find(
    (r) =>
      r.person.email === "ahmad@email.com" && r.bankSampahId === bankSampah3.id,
  );

  if (ahmadAtBank3) {
    const inventarisList3 = await prisma.inventarisSampah.findMany({
      where: { bankSampahId: bankSampah3.id },
    });

    const transaksi3 = await prisma.transaksi.create({
      data: {
        jenis: "PEMASUKAN",
        totalNilai: 30000,
        keterangan: "Penjualan sampah kaleng aluminum",
        nasabahId: ahmadAtBank3.relationship.id,
        bankSampahId: bankSampah3.id,
      },
    });

    await prisma.detailTransaksi.create({
      data: {
        transaksiId: transaksi3.id,
        inventarisSampahId: inventarisList3[4].id, // Kaleng Aluminum
        beratKg: 2,
        hargaPerKg: 15000,
        subtotal: 30000,
      },
    });

    await prisma.nasabah.update({
      where: { id: ahmadAtBank3.relationship.id },
      data: { saldo: { increment: 30000 } },
    });

    await prisma.inventarisSampah.update({
      where: { id: inventarisList3[4].id },
      data: { stokKg: { increment: 2 } },
    });

    console.log("✅ Ahmad transaksi di Bank Sampah 3");
  }

  console.log("✅ Sample transaksi created");
  console.log("🎉 Multi-bank seeding completed!");
  console.log("");
  console.log("📊 SUMMARY:");
  console.log("=" * 50);
  console.log(`🏢 Total Bank Sampah: 3`);
  console.log(`👥 Total Person: ${personData.length}`);
  console.log(
    `🤝 Total Nasabah Relationships: ${allNasabahRelationships.length}`,
  );
  console.log("");
  console.log("🔑 LOGIN CREDENTIALS:");
  console.log("=" * 50);
  console.log("👨‍💼 ADMIN ACCOUNTS:");
  console.log(`   • ${bankSampah1.nama}`);
  console.log(`     Email: ${bankSampah1.email}`);
  console.log(`     Password: password123`);
  console.log(`   • ${bankSampah2.nama}`);
  console.log(`     Email: ${bankSampah2.email}`);
  console.log(`     Password: password123`);
  console.log(`   • ${bankSampah3.nama}`);
  console.log(`     Email: ${bankSampah3.email}`);
  console.log(`     Password: password123`);
  console.log("");
  console.log("👤 NASABAH ACCOUNTS:");
  for (const data of personData) {
    const bankNames = data.registerAt
      .map((id) => {
        const bank = bankSampahs.find((b) => b.id === id);
        return bank?.nama.split(" ").slice(-2).join(" "); // Ambil 2 kata terakhir
      })
      .join(", ");
    console.log(`   • ${data.nama}`);
    console.log(`     Email: ${data.email}`);
    console.log(`     Password: password123`);
    console.log(`     Terdaftar di: ${bankNames}`);
    console.log("");
  }
  console.log("🎯 MULTI-BANK FEATURES DEMO:");
  console.log("=" * 50);
  console.log(
    "• Budi terdaftar di 2 bank sampah (Hijau Lestari & Bersih Sejahtera)",
  );
  console.log("• Ahmad terdaftar di 3 bank sampah (semua bank)");
  console.log(
    "• Siti terdaftar di 2 bank sampah (Hijau Lestari & Cerdas Mandiri)",
  );
  console.log(
    "• Maya terdaftar di 2 bank sampah (Bersih Sejahtera & Cerdas Mandiri)",
  );
  console.log("• Login dengan email yang sama akan otomatis pilih bank aktif");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
