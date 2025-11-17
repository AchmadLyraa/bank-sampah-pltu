// app/actions/bank-sampah.ts
"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import bcrypt from "bcryptjs";
import type { PenimbanganFormData, PenarikanFormData } from "@/types";

export async function getDashboardData(bankSampahId: string) {
  const [
    nasabahCount,
    totalSaldoNasabah,
    inventaris,
    transaksiAgg,
    recentTransaksi,
  ] = await Promise.all([
    // Count active nasabah
    prisma.nasabah.count({
      where: { bankSampahId, isActive: true },
    }),

    // Sum saldo nasabah
    prisma.nasabah.aggregate({
      where: { bankSampahId, isActive: true },
      _sum: { saldo: true },
    }),

    prisma.inventarisSampah.findMany({
      where: { bankSampahId },
      orderBy: { jenisSampah: "asc" },
    }),

    // 🔥 Ambil semua total per jenis transaksi
    prisma.transaksi.groupBy({
      by: ["jenis"],
      where: { bankSampahId },
      _sum: { totalNilai: true },
    }),

    prisma.transaksi.findMany({
      where: { bankSampahId },
      include: {
        nasabah: { select: { person: { select: { nama: true } } } },
        detailTransaksi: {
          include: { inventarisSampah: { select: { jenisSampah: true } } },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  // Map hasil groupBy ke object
  const sumByJenis = transaksiAgg.reduce<Record<string, number>>((acc, t) => {
    acc[t.jenis] = t._sum.totalNilai || 0;
    return acc;
  }, {});

  // 💰 Saldo Nasabah
  const saldoNasabah = totalSaldoNasabah._sum.saldo || 0;

  // 🏦 Saldo Bank Sampah pakai rumus baru
  const saldoBankSampah =
    (sumByJenis["PENJUALAN_SAMPAH"] || 0) +
    (sumByJenis["PEMASUKAN_UMUM"] || 0) -
    ((sumByJenis["PEMASUKAN"] || 0) + (sumByJenis["PENGELUARAN_UMUM"] || 0));

  return {
    nasabahCount,
    saldoNasabah,
    saldoBankSampah,
    inventaris,
    recentTransaksi,
  };
}

export async function updateInventarisAction(formData: FormData) {
  const id = formData.get("id") as string;
  const hargaPerUnit = Number.parseFloat(
    formData.get("hargaPerUnit") as string,
  );

  await prisma.inventarisSampah.update({
    where: { id },
    data: { hargaPerUnit },
  });

  revalidatePath("/bank-sampah/inventaris");
  return { success: true };
}

// Add this to app/actions/bank-sampah.ts

export async function penimbanganAction(data: PenimbanganFormData) {
  const { nasabahId, items } = data;

  // Calculate total
  let totalNilai = 0;
  const detailItems = [];

  for (const item of items) {
    const inventaris = await prisma.inventarisSampah.findUnique({
      where: { id: item.inventarisSampahId },
    });
    if (!inventaris) continue;

    const subtotal = item.jumlahUnit * inventaris.hargaPerUnit;
    totalNilai += subtotal;

    detailItems.push({
      inventarisSampahId: item.inventarisSampahId,
      jumlahUnit: item.jumlahUnit,
      hargaPerUnit: inventaris.hargaPerUnit,
      subtotal,
    });
  }

  // Create transaction
  const nasabahRelationship = await prisma.nasabah.findUnique({
    where: { id: nasabahId },
    include: { person: true },
  });

  if (!nasabahRelationship) {
    throw new Error("Hubungan nasabah tidak ditemukan");
  }

  if (!nasabahRelationship.isActive) {
    throw new Error(
      "Hubungan nasabah sudah non-aktif, tidak bisa melakukan transaksi",
    );
  }

  const transaksi = await prisma.transaksi.create({
    data: {
      jenis: "PEMASUKAN",
      totalNilai,
      keterangan: "Penjualan sampah",
      nasabahId,
      bankSampahId: nasabahRelationship.bankSampahId,
      detailTransaksi: {
        create: detailItems,
      },
    },
  });

  // Update nasabah saldo
  await prisma.nasabah.update({
    where: { id: nasabahId },
    data: { saldo: { increment: totalNilai } },
  });

  // Update inventaris stok
  for (const item of items) {
    await prisma.inventarisSampah.update({
      where: { id: item.inventarisSampahId },
      data: { stokUnit: { increment: item.jumlahUnit } },
    });
  }

  revalidatePath("/bank-sampah");
  revalidatePath("/bank-sampah/penimbangan");

  return { success: true, transaksiId: transaksi.id };
}

export async function penarikanAction(data: PenarikanFormData) {
  const { nasabahId, jumlah } = data; // nasabahId is the ID of the Nasabah relationship

  const nasabahRelationship = await prisma.nasabah.findUnique({
    where: { id: nasabahId },
    include: { person: true }, // Include person data for checks/info
  });

  if (!nasabahRelationship) {
    throw new Error("Hubungan nasabah tidak ditemukan");
  }

  // Check if nasabah relationship is active
  if (!nasabahRelationship.isActive) {
    throw new Error(
      "Hubungan nasabah sudah non-aktif, tidak bisa melakukan penarikan",
    );
  }

  if (nasabahRelationship.saldo < jumlah) {
    throw new Error("Saldo tidak mencukupi");
  }

  // Create transaction
  await prisma.transaksi.create({
    data: {
      jenis: "PENGELUARAN",
      totalNilai: jumlah,
      keterangan: "Penarikan saldo",
      nasabahId, // Use the Nasabah relationship ID
      bankSampahId: nasabahRelationship.bankSampahId,
    },
  });

  // Update nasabah saldo (on the relationship)
  await prisma.nasabah.update({
    where: { id: nasabahId },
    data: { saldo: { decrement: jumlah } },
  });

  revalidatePath("/bank-sampah");
  return { success: true };
}

// 🐛 FIXED: Penjualan sampah action - MASALAH ADA DI SINI!
export async function penjualanSampahAction(formData: FormData) {
  try {
    const inventarisSampahId = formData.get("inventarisSampahId") as string;
    const jumlahUnit = Number.parseFloat(formData.get("jumlahUnit") as string);
    const hargaPerUnit = Number.parseFloat(
      formData.get("hargaPerUnit") as string,
    );

    // Validasi input
    if (
      !inventarisSampahId ||
      !jumlahUnit ||
      !hargaPerUnit ||
      jumlahUnit <= 0 ||
      hargaPerUnit <= 0
    ) {
      throw new Error("Data tidak valid");
    }

    const inventaris = await prisma.inventarisSampah.findUnique({
      where: { id: inventarisSampahId },
    });

    if (!inventaris) {
      throw new Error("Inventaris tidak ditemukan");
    }

    if (inventaris.stokUnit < jumlahUnit) {
      throw new Error(
        `Stok tidak mencukupi. Stok tersedia: ${inventaris.stokUnit}${inventaris.satuan}`,
      );
    }

    // Hitung total
    const totalNilai = jumlahUnit * hargaPerUnit;

    // Create transaction
    const transaksi = await prisma.transaksi.create({
      data: {
        jenis: "PENJUALAN_SAMPAH",
        totalNilai,
        keterangan: `Penjualan ${inventaris.jenisSampah} ${jumlahUnit}${inventaris.satuan} @ Rp${hargaPerUnit.toLocaleString()}/${inventaris.satuan}`,
        nasabahId: null,
        bankSampahId: inventaris.bankSampahId,
      },
    });

    // Create detail transaksi
    await prisma.detailTransaksi.create({
      data: {
        transaksiId: transaksi.id,
        inventarisSampahId: inventarisSampahId,
        jumlahUnit: jumlahUnit,
        hargaPerUnit: hargaPerUnit,
        subtotal: totalNilai,
      },
    });

    // Update stok
    await prisma.inventarisSampah.update({
      where: { id: inventarisSampahId },
      data: { stokUnit: { decrement: jumlahUnit } },
    });

    revalidatePath("/bank-sampah");
    revalidatePath("/bank-sampah/inventaris");
    revalidatePath("/bank-sampah/laporan");

    return {
      success: true,
      message: `Berhasil jual ${jumlahUnit}${inventaris.satuan} dengan total Rp${totalNilai.toLocaleString()}!`,
      data: {
        jumlahUnit,
        hargaPerUnit,
        totalNilai,
      },
    };
  } catch (error) {
    console.error("❌ Error in penjualanSampahAction:", error);
    throw error;
  }
}

export async function updateBankSampahProfileAction(formData: FormData) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.userType !== "bank-sampah") {
    return { error: "Unauthorized" };
  }

  const bankSampahId = formData.get("bankSampahId")?.toString();
  const telepon = formData.get("telepon")?.toString();
  const alamat = formData.get("alamat")?.toString();
  const latitude = formData.get("latitude")?.toString();
  const longitude = formData.get("longitude")?.toString();

  if (!bankSampahId || !telepon || !alamat) {
    return { error: "Data tidak lengkap" };
  }

  if (bankSampahId !== session.user.id) {
    return { error: "Unauthorized" };
  }

  try {
    const updateData: any = {
      telepon,
      alamat,
      updatedAt: new Date(),
    };

    // Add latitude and longitude if provided
    if (latitude && latitude.trim() !== "") {
      updateData.latitude = Number.parseFloat(latitude);
    }
    if (longitude && longitude.trim() !== "") {
      updateData.longitude = Number.parseFloat(longitude);
    }

    await prisma.bankSampah.update({
      where: { id: bankSampahId },
      data: updateData,
    });

    revalidatePath("/bank-sampah/profile");
    return { message: "Profil berhasil diperbarui" };
  } catch (error) {
    return { error: "Terjadi kesalahan saat memperbarui profil" };
  }
}

export async function changeBankSampahPasswordAction(formData: FormData) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.userType !== "bank-sampah") {
    return { error: "Unauthorized" };
  }

  const bankSampahId = formData.get("bankSampahId")?.toString();
  const currentPassword = formData.get("currentPassword")?.toString();
  const newPassword = formData.get("newPassword")?.toString();
  const confirmPassword = formData.get("confirmPassword")?.toString();

  if (!bankSampahId || !currentPassword || !newPassword || !confirmPassword) {
    return { error: "Data tidak lengkap" };
  }

  if (bankSampahId !== session.user.id) {
    return { error: "Unauthorized" };
  }

  try {
    // Validasi password baru
    if (newPassword !== confirmPassword) {
      return { error: "Password baru dan konfirmasi password tidak sama" };
    }

    if (newPassword.length < 6) {
      return { error: "Password baru minimal 6 karakter" };
    }

    // Cek password lama
    const bankSampah = await prisma.bankSampah.findUnique({
      where: { id: bankSampahId },
    });

    if (!bankSampah) {
      return { error: "Bank sampah tidak ditemukan" };
    }

    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      bankSampah.password,
    );
    if (!isCurrentPasswordValid) {
      return { error: "Password lama tidak benar" };
    }

    // Hash password baru
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await prisma.bankSampah.update({
      where: { id: bankSampahId },
      data: {
        password: hashedNewPassword,
        updatedAt: new Date(),
      },
    });

    revalidatePath("/bank-sampah/profile");
    return { message: "Password berhasil diubah!" };
  } catch (error) {
    console.error("Error changing password:", error);
    return { error: "Terjadi kesalahan saat mengubah password" };
  }
}
