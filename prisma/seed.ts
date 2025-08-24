import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { execSync } from "child_process"; // 🆕 Import execSync

const prisma = new PrismaClient();

async function main() {
  console.log("🔄 Resetting database before seeding...");
  // 🆕 Reset database sebelum seeding untuk menghindari duplikasi data
  execSync("npx prisma db push --force-reset", { stdio: "inherit" });
  console.log("✅ Database reset complete.");

  console.log("🌱 Seeding database with multi-bank support...");

  // Hash password untuk demo
  const hashedPassword = await bcrypt.hash("password123", 10);

  const controller = await prisma.controller.upsert({
    where: { email: "admin@controller.com" },
    update: {},
    create: {
      nama: "Super Admin Controller",
      email: "admin@controller.com",
      password: hashedPassword,
    },
  });
  console.log("✅ Controller account created/updated");

  // 🏢 Buat atau update Bank Sampah
  const bankSampah1 = await prisma.bankSampah.upsert({
    where: { email: "admin@banksampah.com" },
    update: {},
    create: {
      nama: "Bank Sampah Hijau Lestari",
      alamat: "Jl. Lingkungan No. 123, Bogor",
      telepon: "0251-1234567",
      email: "admin@banksampah.com",
      password: hashedPassword,
      longitude: -6.5971,
      latitude: 106.806,
      isActive: true,
      role: "BANK_SAMPAH",
    },
  });

  const bankSampah2 = await prisma.bankSampah.upsert({
    where: { email: "admin@banksampahbersih.com" },
    update: {},
    create: {
      nama: "Bank Sampah Bersih Sejahtera",
      alamat: "Jl. Kebersihan No. 456, Jakarta",
      telepon: "021-9876543",
      email: "admin@banksampahbersih.com",
      password: hashedPassword,
      longitude: -6.2088,
      latitude: 106.8456,
      isActive: true,
      role: "BANK_SAMPAH",
    },
  });

  const bankSampah3 = await prisma.bankSampah.upsert({
    where: { email: "admin@banksampahcerdas.com" },
    update: {},
    create: {
      nama: "Bank Sampah Cerdas Mandiri",
      alamat: "Jl. Inovasi No. 789, Bandung",
      telepon: "022-5555666",
      email: "admin@banksampahcerdas.com",
      password: hashedPassword,
      longitude: -6.9175,
      latitude: 107.6191,
      isActive: true,
      role: "BANK_SAMPAH",
    },
  });

  const bankSampahs = [bankSampah1, bankSampah2, bankSampah3];

  console.log("✅ Bank Sampah created/updated:");
  bankSampahs.forEach((b) => console.log(`   - ${b.nama} (${b.email})`));

  // 📦 Buat atau update Inventaris untuk semua Bank Sampah
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
        update: {
          hargaPerKg: Math.round(template.hargaPerKg * priceMultiplier),
        },
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
  console.log("✅ Inventaris created/updated for all bank sampah");

  // 👥 Buat atau update Person (individu) dan Nasabah relationships
  const personData = [
    {
      nama: "Budi Santoso",
      nik: "1234567890123456",
      alamat: "Jl. Mawar No. 45, Bogor",
      telepon: "081234567890",
      email: "budi@email.com",
      registerAt: [bankSampah1.id, bankSampah2.id], // Terdaftar di 2 bank
    },
    {
      nama: "Siti Nurhaliza",
      nik: "1234567890123457",
      alamat: "Jl. Melati No. 67, Jakarta",
      telepon: "081234567891",
      email: "siti@email.com",
      registerAt: [bankSampah1.id, bankSampah3.id], // Terdaftar di 2 bank
    },
    {
      nama: "Ahmad Wijaya",
      nik: "1234567890123458",
      alamat: "Jl. Anggrek No. 89, Bandung",
      telepon: "081234567892",
      email: "ahmad@email.com",
      registerAt: [bankSampah1.id, bankSampah2.id, bankSampah3.id], // Terdaftar di 3 bank
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
      registerAt: [bankSampah2.id, bankSampah3.id], // Terdaftar di 2 bank
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

  const allNasabahRelationships = [];

  for (const data of personData) {
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
    }
  }
  console.log(`✅ Total Person created/updated: ${personData.length}`);
  console.log(
    `✅ Total Nasabah relationships created/updated: ${allNasabahRelationships.length}`,
  );

  // 📊 Buat sample transaksi untuk demonstrasi
  const inventarisListMap = new Map<string, any[]>();
  for (const bank of bankSampahs) {
    inventarisListMap.set(
      bank.id,
      await prisma.inventarisSampah.findMany({
        where: { bankSampahId: bank.id },
      }),
    );
  }

  // Helper function to create a transaction
  async function createSampleTransaction(
    personEmail: string,
    bankId: string,
    jenisSampahName: string,
    beratKg: number,
    keterangan: string,
    transactionType: "PEMASUKAN" | "PENGELUARAN",
  ) {
    const nasabahRel = allNasabahRelationships.find(
      (r) => r.person.email === personEmail && r.bankSampahId === bankId,
    );
    if (!nasabahRel) {
      console.warn(
        `Skipping transaction for ${personEmail} at bank ${bankId}: relationship not found.`,
      );
      return;
    }

    const inventarisList = inventarisListMap.get(bankId);
    const inventarisItem = inventarisList?.find(
      (inv) => inv.jenisSampah === jenisSampahName,
    );

    let totalNilai = 0;
    const detailTransaksiData = [];

    if (transactionType === "PEMASUKAN" && inventarisItem) {
      totalNilai = beratKg * inventarisItem.hargaPerKg;
      detailTransaksiData.push({
        inventarisSampahId: inventarisItem.id,
        beratKg: beratKg,
        hargaPerKg: inventarisItem.hargaPerKg,
        subtotal: totalNilai,
      });
    } else if (transactionType === "PENGELUARAN") {
      totalNilai = beratKg; // For withdrawals, beratKg is actually the amount
    }

    const transaksi = await prisma.transaksi.create({
      data: {
        jenis: transactionType,
        totalNilai: totalNilai,
        keterangan: keterangan,
        nasabahId: nasabahRel.relationship.id,
        bankSampahId: bankId,
        ...(detailTransaksiData.length > 0 && {
          detailTransaksi: { create: detailTransaksiData },
        }),
      },
    });

    // Update saldo nasabah
    await prisma.nasabah.update({
      where: { id: nasabahRel.relationship.id },
      data: {
        saldo: {
          [transactionType === "PEMASUKAN" ? "increment" : "decrement"]:
            totalNilai,
        },
      },
    });

    // Update inventaris stok (only for PEMASUKAN)
    if (transactionType === "PEMASUKAN" && inventarisItem) {
      await prisma.inventarisSampah.update({
        where: { id: inventarisItem.id },
        data: { stokKg: { increment: beratKg } },
      });
    }
    console.log(
      `✅ Transaksi ${transactionType} untuk ${personEmail} di ${bankSampahs.find((b) => b.id === bankId)?.nama}`,
    );
  }

  // Sample transactions
  await createSampleTransaction(
    "budi@email.com",
    bankSampah1.id,
    "Plastik Botol",
    2,
    "Penjualan sampah plastik botol",
    "PEMASUKAN",
  );
  await createSampleTransaction(
    "budi@email.com",
    bankSampah2.id,
    "Kertas Kardus",
    3,
    "Penjualan sampah kertas kardus",
    "PEMASUKAN",
  );
  await createSampleTransaction(
    "siti@email.com",
    bankSampah1.id,
    "Plastik Kemasan",
    1.5,
    "Penjualan sampah plastik kemasan",
    "PEMASUKAN",
  );
  await createSampleTransaction(
    "ahmad@email.com",
    bankSampah3.id,
    "Kaleng Aluminum",
    2,
    "Penjualan sampah kaleng aluminum",
    "PEMASUKAN",
  );
  await createSampleTransaction(
    "budi@email.com",
    bankSampah1.id,
    "",
    2000,
    "Penarikan saldo",
    "PENGELUARAN",
  );

  console.log("✅ Sample transaksi created");
  console.log("🎉 Seeding completed!");
  console.log("");
  console.log("📊 SUMMARY:");
  console.log("=" * 50);
  console.log(`🏢 Total Bank Sampah: ${bankSampahs.length}`);
  console.log(`👥 Total Person: ${personData.length}`);
  console.log(
    `🤝 Total Nasabah Relationships: ${allNasabahRelationships.length}`,
  );
  console.log("");
  console.log("🔑 LOGIN CREDENTIALS:");
  console.log("=" * 50);
  console.log("🎛️ CONTROLLER ACCOUNT:");
  console.log(`   • ${controller.nama}`);
  console.log(`     Email: ${controller.email}`);
  console.log(`     Password: password123`);
  console.log("");
  console.log("👨‍💼 ADMIN ACCOUNTS:");
  bankSampahs.forEach((bank) => {
    console.log(`   • ${bank.nama}`);
    console.log(`     Email: ${bank.email}`);
    console.log(`     Password: password123`);
  });
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
  console.log(
    "• Login dengan email yang sama akan otomatis pilih bank aktif (yang pertama ditemukan)",
  );
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
