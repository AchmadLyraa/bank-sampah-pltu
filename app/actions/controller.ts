"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { Role } from "@/types";
import bcrypt from "bcryptjs";
import { isEmailBankSampahUnique } from "@/lib/email-validator-bs";
import { isEmailUnique } from "@/lib/email-validator";

export async function getBankSampahList() {
  try {
    const session = await getServerSession(authOptions);

    if (
      !session ||
      session.user.userType !== "controller" ||
      session.user.role !== Role.CONTROLLER
    ) {
      return { success: false, error: "Unauthorized" };
    }

    const bankSampahList = await prisma.bankSampah.findMany({
      include: {
        _count: {
          select: {
            nasabah: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return { success: true, data: bankSampahList };
  } catch (error) {
    console.error("Error fetching bank sampah list:", error);
    return { success: false, error: "Terjadi kesalahan sistem" };
  }
}

export async function getBankSampahLocations() {
  try {
    const session = await getServerSession(authOptions);

    if (
      !session ||
      session.user.userType !== "controller" ||
      session.user.role !== Role.CONTROLLER
    ) {
      return { success: false, error: "Unauthorized" };
    }

    const bankSampahList = await prisma.bankSampah.findMany({
      where: {
        latitude: { not: null },
        longitude: { not: null },
      },
      select: {
        id: true,
        nama: true,
        email: true,
        alamat: true,
        latitude: true,
        longitude: true,
        isActive: true,
        _count: {
          select: {
            nasabah: true,
          },
        },
      },
      orderBy: { nama: "asc" },
    });

    return { success: true, data: bankSampahList };
  } catch (error) {
    console.error("Error fetching bank sampah locations:", error);
    return { success: false, error: "Terjadi kesalahan sistem" };
  }
}

export async function getBankSampahListPaginated(
  page = 1,
  search = "",
  limit = 10,
) {
  try {
    const session = await getServerSession(authOptions);

    if (
      !session ||
      session.user.userType !== "controller" ||
      session.user.role !== Role.CONTROLLER
    ) {
      return { success: false, error: "Unauthorized" };
    }

    const skip = (page - 1) * limit;

    // Build search filter
    const searchFilter = search
      ? {
          OR: [
            { nama: { contains: search, mode: "insensitive" as const } },
            { email: { contains: search, mode: "insensitive" as const } },
            { alamat: { contains: search, mode: "insensitive" as const } },
            { telepon: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {};

    // Get total count for pagination
    const totalItems = await prisma.bankSampah.count({
      where: searchFilter,
    });

    // Get paginated data
    const bankSampahList = await prisma.bankSampah.findMany({
      where: searchFilter,
      include: {
        _count: {
          select: {
            nasabah: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    });

    const totalPages = Math.ceil(totalItems / limit);

    return {
      success: true,
      data: bankSampahList,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems,
        itemsPerPage: limit,
      },
    };
  } catch (error) {
    console.error("Error fetching paginated bank sampah list:", error);
    return { success: false, error: "Terjadi kesalahan sistem" };
  }
}

export async function getBankSampahIndividualProfit(
  bankSampahId: string,
  dateFilter = "30",
) {
  try {
    const session = await getServerSession(authOptions);

    if (
      !session ||
      session.user.userType !== "controller" ||
      session.user.role !== Role.CONTROLLER
    ) {
      return { success: false, error: "Unauthorized" };
    }

    // Calculate date range based on filter
    let startDate: Date;
    const endDate = new Date();
    endDate.setHours(23, 59, 59, 999);

    const bankSampah = await prisma.bankSampah.findUnique({
      where: { id: bankSampahId },
      select: { createdAt: true },
    });

    switch (dateFilter) {
      case "1":
        startDate = new Date();
        startDate.setHours(0, 0, 0, 0);
        break;
      case "7":
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 7);
        break;
      case "14":
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 14);
        break;
      case "30":
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 30);
        break;
      case "all":
        startDate = bankSampah?.createdAt || new Date("2020-01-01");
        break;
      default:
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 30);
    }

    // Get daily profit data
    const transactions = await prisma.transaksi.findMany({
      where: {
        bankSampahId,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        jenis: true,
        totalNilai: true,
        createdAt: true,
      },
      orderBy: { createdAt: "asc" },
    });

    // Group transactions by date and calculate daily profit
    const dailyProfitMap = new Map<string, number>();

    transactions.forEach((transaction) => {
      const dateKey = transaction.createdAt.toISOString().split("T")[0];
      const currentProfit = dailyProfitMap.get(dateKey) || 0;

      if (transaction.jenis === "PENJUALAN_SAMPAH") {
        // Penjualan increases profit
        dailyProfitMap.set(dateKey, currentProfit + transaction.totalNilai);
      } else if (transaction.jenis === "PEMASUKAN") {
        // Pemasukan decreases profit (cost)
        dailyProfitMap.set(dateKey, currentProfit - transaction.totalNilai);
      }
    });

    // Convert to array and fill missing dates with 0
    const profitData = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const dateKey = currentDate.toISOString().split("T")[0];
      const profit = dailyProfitMap.get(dateKey) || 0;

      profitData.push({
        date: dateKey,
        profit,
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return { success: true, data: profitData };
  } catch (error) {
    console.error("Error fetching individual bank sampah profit:", error);
    return { success: false, error: "Terjadi kesalahan sistem" };
  }
}

export async function getBankSampahPembelianKg(
  bankSampahId: string,
  dateFilter = "30",
) {
  try {
    const session = await getServerSession(authOptions);
    if (
      !session ||
      session.user.userType !== "controller" ||
      session.user.role !== Role.CONTROLLER
    ) {
      return { success: false, error: "Unauthorized" };
    }

    // Tentukan range tanggal
    let startDate: Date;
    const endDate = new Date();
    endDate.setHours(23, 59, 59, 999);

    switch (dateFilter) {
      case "1":
        startDate = new Date();
        startDate.setHours(0, 0, 0, 0);
        break;
      case "7":
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 7);
        break;
      case "14":
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 14);
        break;
      case "30":
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 30);
        break;
      case "all":
        const bank = await prisma.bankSampah.findUnique({
          where: { id: bankSampahId },
          select: { createdAt: true },
        });
        startDate = bank?.createdAt || new Date("2020-01-01");
        break;
      default:
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 30);
    }

    // Ambil detail transaksi per jenis sampah
    const details = await prisma.detailTransaksi.findMany({
      where: {
        transaksi: {
          bankSampahId,
          jenis: "PEMASUKAN",
          createdAt: { gte: startDate, lte: endDate },
        },
      },
      select: {
        beratKg: true,
        createdAt: true,
        inventarisSampah: { select: { jenisSampah: true } },
      },
      orderBy: { createdAt: "asc" },
    });

    // Group per jenis + tanggal
    const dataMap = new Map<string, Map<string, number>>();

    details.forEach((d) => {
      const dateKey = d.createdAt.toISOString().split("T")[0];
      const jenis = d.inventarisSampah.jenisSampah;

      if (!dataMap.has(jenis)) {
        dataMap.set(jenis, new Map());
      }
      const jenisMap = dataMap.get(jenis)!;
      const current = jenisMap.get(dateKey) || 0;
      jenisMap.set(dateKey, current + d.beratKg);
    });

    // Susun result biar gampang dipakai di chart
    const result: { jenis: string; date: string; beratKg: number }[] = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const dateKey = currentDate.toISOString().split("T")[0];

      for (const [jenis, jenisMap] of dataMap.entries()) {
        result.push({
          jenis,
          date: dateKey,
          beratKg: jenisMap.get(dateKey) || 0,
        });
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return { success: true, data: result };
  } catch (error) {
    console.error("Error fetching pembelian kg per jenis:", error);
    return { success: false, error: "Terjadi kesalahan sistem" };
  }
}

export async function createBankSampah(formData: FormData) {
  try {
    const session = await getServerSession(authOptions);

    if (
      !session ||
      session.user.userType !== "controller" ||
      session.user.role !== Role.CONTROLLER
    ) {
      return { success: false, error: "Unauthorized" };
    }

    const nama = formData.get("nama") as string;
    const alamat = formData.get("alamat") as string;
    const telepon = formData.get("telepon") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const longitude = formData.get("longitude") as string;
    const latitude = formData.get("latitude") as string;

    if (!nama || !alamat || !telepon || !email || !password) {
      return { success: false, error: "Semua field wajib diisi" };
    }

    const emailIsUnique = await isEmailBankSampahUnique(email);
    if (!emailIsUnique) {
      return { success: false, error: "Email sudah terdaftar di sistem" };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const bankSampah = await prisma.bankSampah.create({
      data: {
        nama,
        alamat,
        telepon,
        email,
        password: hashedPassword,
        longitude: longitude ? Number.parseFloat(longitude) : null,
        latitude: latitude ? Number.parseFloat(latitude) : null,
        isActive: true,
        role: Role.BANK_SAMPAH,
      },
    });

    return { success: true, data: bankSampah };
  } catch (error) {
    console.error("Error creating bank sampah:", error);
    return { success: false, error: "Terjadi kesalahan sistem" };
  }
}

export async function toggleBankSampahStatus(bankSampahId: string) {
  try {
    const session = await getServerSession(authOptions);

    if (
      !session ||
      session.user.userType !== "controller" ||
      session.user.role !== Role.CONTROLLER
    ) {
      return { success: false, error: "Unauthorized" };
    }

    const bankSampah = await prisma.bankSampah.findUnique({
      where: { id: bankSampahId },
    });

    if (!bankSampah) {
      return { success: false, error: "Bank sampah tidak ditemukan" };
    }

    const updatedBankSampah = await prisma.bankSampah.update({
      where: { id: bankSampahId },
      data: { isActive: !bankSampah.isActive },
    });

    return { success: true, data: updatedBankSampah };
  } catch (error) {
    console.error("Error toggling bank sampah status:", error);
    return { success: false, error: "Terjadi kesalahan sistem" };
  }
}

export async function updateControllerProfile(formData: FormData) {
  try {
    const session = await getServerSession(authOptions);

    if (
      !session ||
      session.user.userType !== "controller" ||
      session.user.role !== Role.CONTROLLER
    ) {
      return { success: false, error: "Unauthorized" };
    }

    const nama = formData.get("nama") as string;
    // const email = formData.get("email") as string

    if (!nama) {
      return { success: false, error: "Nama dan email wajib diisi" };
    }

    // const emailIsUnique = await isEmailUnique(email, session.user.id, "controller")
    // if (!emailIsUnique) {
    //   return { success: false, error: "Email sudah digunakan di sistem" }
    // }

    const updatedController = await prisma.controller.update({
      where: { id: session.user.id },
      data: { nama },
    });

    return {
      success: true,
      message: "Profil berhasil diperbarui",
      data: updatedController,
    };
  } catch (error) {
    console.error("Error updating controller profile:", error);
    return { success: false, error: "Terjadi kesalahan sistem" };
  }
}

export async function getBankSampahDetail(bankSampahId: string) {
  try {
    const session = await getServerSession(authOptions);

    if (
      !session ||
      session.user.userType !== "controller" ||
      session.user.role !== Role.CONTROLLER
    ) {
      return { success: false, error: "Unauthorized" };
    }

    // Get bank sampah info
    const bankSampah = await prisma.bankSampah.findUnique({
      where: { id: bankSampahId },
    });

    if (!bankSampah) {
      return { success: false, error: "Bank sampah tidak ditemukan" };
    }

    // Get nasabah details with saldo
    const nasabahDetails = await prisma.nasabah.findMany({
      where: { bankSampahId },
      include: {
        person: {
          select: {
            nama: true,
            email: true,
          },
        },
      },
      orderBy: { saldo: "desc" },
    });

    // Get inventaris sampah
    const inventaris = await prisma.inventarisSampah.findMany({
      where: { bankSampahId },
      orderBy: { jenisSampah: "asc" },
      select: {
        id: true,
        jenisSampah: true,
        satuan: true,
        hargaPerUnit: true,
        stokUnit: true,
        isActive: true,
      },
    });

    const transaksi = await prisma.transaksi.findMany({
      where: { bankSampahId },
      include: {
        nasabah: {
          include: {
            person: { select: { nama: true } },
          },
        },
        detailTransaksi: {
          include: {
            inventarisSampah: {
              select: {
                id: true,
                jenisSampah: true,
                satuan: true,
                hargaPerUnit: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    const transaksiAgg = await prisma.transaksi.groupBy({
      by: ["jenis"],
      where: { bankSampahId },
      _sum: { totalNilai: true },
    });

    const totalPemasukan = await prisma.transaksi.aggregate({
      where: {
        bankSampahId,
        jenis: "PEMASUKAN",
      },
      _sum: { totalNilai: true },
    });

    const totalPenjualan = await prisma.transaksi.aggregate({
      where: {
        bankSampahId,
        jenis: "PENJUALAN_SAMPAH",
      },
      _sum: { totalNilai: true },
    });

    const totalPenarikan = await prisma.transaksi.aggregate({
      where: {
        bankSampahId,
        jenis: "PENGELUARAN",
      },
      _sum: { totalNilai: true },
    });

    // total stok terkumpul -> sum stokUnit (bukan stokKg)
    const totalStokTerkumpul = inventaris.reduce(
      (sum, item) => sum + (item.stokUnit ?? 0),
      0,
    );

    // Calculate statistics
    const totalNasabah = nasabahDetails.length;
    const nasabahAktif = nasabahDetails.filter((n) => n.isActive).length;
    const nasabahNonaktif = totalNasabah - nasabahAktif;
    const totalSaldo = nasabahDetails.reduce((sum, n) => sum + n.saldo, 0);
    const totalInventaris = inventaris.length;
    const totalTransaksi = transaksi.length;

    // Format nasabah details for display
    const formattedNasabahDetails = nasabahDetails.map((nasabah) => ({
      id: nasabah.id,
      nama: nasabah.person.nama,
      email: nasabah.person.email,
      saldo: nasabah.saldo,
      isActive: nasabah.isActive,
    }));

    const formattedTransaksi = transaksi.map((t) => ({
      id: t.id,
      jenis: t.jenis,
      totalNilai: t.totalNilai,
      keterangan: t.keterangan,
      createdAt: t.createdAt,
      nasabahNama: t.nasabah?.person?.nama || "Sistem",
      detailTransaksi:
        t.detailTransaksi?.map((d) => ({
          id: d.id,
          jumlahUnit: d.jumlahUnit, // sesuai schema baru
          hargaPerUnit: d.hargaPerUnit,
          subtotal: d.subtotal,
          inventarisSampah: {
            id: d.inventarisSampah?.id,
            jenisSampah: d.inventarisSampah?.jenisSampah,
            satuan: d.inventarisSampah?.satuan,
          },
        })) || [],
    }));

    const sumByJenis: Record<string, number> = transaksiAgg.reduce(
      (acc, t) => {
        acc[t.jenis] = t._sum.totalNilai || 0;
        return acc;
      },
      {} as Record<string, number>,
    );

    const saldoNasabah = totalSaldo; // yang udah ada

    const saldoBankSampah =
      (sumByJenis["PENJUALAN_SAMPAH"] || 0) +
      (sumByJenis["PEMASUKAN_UMUM"] || 0) -
      ((sumByJenis["PEMASUKAN"] || 0) + (sumByJenis["PENGELUARAN_UMUM"] || 0));

    const data = {
      bankSampah,
      statistics: {
        totalNasabah,
        nasabahAktif,
        nasabahNonaktif,
        totalSaldo,
        saldoNasabah,
        totalInventaris,
        totalTransaksi,
        saldoBankSampah,
        totalGabungan: saldoNasabah + saldoBankSampah,
        totalPemasukan: totalPemasukan._sum.totalNilai || 0,
        totalPenjualan: totalPenjualan._sum.totalNilai || 0,
        totalPenarikan: totalPenarikan._sum.totalNilai || 0,
        totalStokTerkumpul,
        keuntungan:
          (totalPenjualan._sum.totalNilai || 0) -
          (totalPemasukan._sum.totalNilai || 0),
      },
      nasabahDetails: formattedNasabahDetails,
      inventaris,
      transaksi: formattedTransaksi,
    };

    return { success: true, data };
  } catch (error) {
    console.error("Error fetching bank sampah detail:", error);
    return { success: false, error: "Terjadi kesalahan sistem" };
  }
}

export async function getBankSampahProfitData(
  startDate?: Date,
  endDate?: Date,
) {
  try {
    const session = await getServerSession(authOptions);

    if (
      !session ||
      session.user.userType !== "controller" ||
      session.user.role !== Role.CONTROLLER
    ) {
      return { success: false, error: "Unauthorized" };
    }

    // Setup date filter
    const dateFilter =
      startDate && endDate
        ? {
            createdAt: {
              gte: startDate,
              lte: endDate,
            },
          }
        : {};

    // Get all active bank sampah
    const bankSampahList = await prisma.bankSampah.findMany({
      where: { isActive: true },
      select: { id: true, nama: true },
      orderBy: { nama: "asc" },
    });

    // Get profit data for each bank sampah
    const profitData = await Promise.all(
      bankSampahList.map(async (bankSampah) => {
        // Get pemasukan (sampah masuk dari nasabah)
        const pemasukan = await prisma.transaksi.aggregate({
          where: {
            bankSampahId: bankSampah.id,
            jenis: "PEMASUKAN",
            ...dateFilter,
          },
          _sum: { totalNilai: true },
        });

        // Get penjualan (sampah keluar ke pihak ketiga)
        const penjualan = await prisma.transaksi.aggregate({
          where: {
            bankSampahId: bankSampah.id,
            jenis: "PENJUALAN_SAMPAH",
            ...dateFilter,
          },
          _sum: { totalNilai: true },
        });

        const totalPemasukan = pemasukan._sum.totalNilai || 0;
        const totalPenjualan = penjualan._sum.totalNilai || 0;
        const keuntungan = totalPenjualan - totalPemasukan;

        return {
          bankSampahId: bankSampah.id,
          nama: bankSampah.nama,
          totalPemasukan,
          totalPenjualan,
          keuntungan,
        };
      }),
    );

    return { success: true, data: profitData };
  } catch (error) {
    console.error("Error fetching profit data:", error);
    return { success: false, error: "Terjadi kesalahan sistem" };
  }
}

export async function resetUserPassword(formData: FormData) {
  try {
    const session = await getServerSession(authOptions);

    if (
      !session ||
      session.user.userType !== "controller" ||
      session.user.role !== Role.CONTROLLER
    ) {
      return { success: false, error: "Unauthorized" };
    }

    const email = formData.get("email") as string;

    if (!email) {
      return { success: false, error: "Email wajib diisi" };
    }

    // Generate new password (8 characters, alphanumeric)
    const newPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Check if email exists in Person table (nasabah)
    const person = await prisma.person.findUnique({
      where: { email },
    });

    if (person) {
      // Update person password
      await prisma.person.update({
        where: { id: person.id },
        data: { password: hashedPassword },
      });

      return {
        success: true,
        message: `Password berhasil direset untuk nasabah: ${person.nama}`,
        newPassword,
        userName: person.nama,
        userType: "Nasabah",
      };
    }

    // Check if email exists in BankSampah table
    const bankSampah = await prisma.bankSampah.findUnique({
      where: { email },
    });

    if (bankSampah) {
      // Update bank sampah password
      await prisma.bankSampah.update({
        where: { id: bankSampah.id },
        data: { password: hashedPassword },
      });

      return {
        success: true,
        message: `Password berhasil direset untuk bank sampah: ${bankSampah.nama}`,
        newPassword,
        userName: bankSampah.nama,
        userType: "Bank Sampah",
      };
    }

    // Email not found in any table
    return {
      success: false,
      error:
        "Email tidak ditemukan di sistem. Pastikan email sudah terdaftar sebagai nasabah atau bank sampah.",
    };
  } catch (error) {
    console.error("Error resetting user password:", error);
    return { success: false, error: "Terjadi kesalahan sistem" };
  }
}

export async function toggleNasabahStatus(nasabahId: string) {
  try {
    const session = await getServerSession(authOptions);

    if (
      !session ||
      session.user.userType !== "controller" ||
      session.user.role !== Role.CONTROLLER
    ) {
      return { success: false, error: "Unauthorized" };
    }

    const nasabah = await prisma.nasabah.findUnique({
      where: { id: nasabahId },
    });

    if (!nasabah) {
      return { success: false, error: "Nasabah tidak ditemukan" };
    }

    const updatedNasabah = await prisma.nasabah.update({
      where: { id: nasabahId },
      data: { isActive: !nasabah.isActive },
    });

    return { success: true, data: updatedNasabah };
  } catch (error) {
    console.error("Error toggling nasabah status:", error);
    return { success: false, error: "Terjadi kesalahan sistem" };
  }
}

export async function addNasabahToBank(formData: FormData) {
  try {
    const session = await getServerSession(authOptions);

    if (
      !session ||
      session.user.userType !== "controller" ||
      session.user.role !== Role.CONTROLLER
    ) {
      return { success: false, error: "Unauthorized" };
    }

    const bankSampahId = formData.get("bankSampahId") as string;
    const nama = formData.get("nama") as string;
    const email = formData.get("email") as string;
    const nik = formData.get("nik") as string;
    const telepon = formData.get("telepon") as string;
    const alamat = formData.get("alamat") as string;
    const password = formData.get("password") as string;

    if (
      !bankSampahId ||
      !nama ||
      !email ||
      !nik ||
      !telepon ||
      !alamat ||
      !password
    ) {
      return { success: false, error: "Semua field wajib diisi" };
    }

    const emailIsUnique = await isEmailUnique(email);
    if (!emailIsUnique) {
      return { success: false, error: "Email sudah terdaftar di sistem" };
    }

    const bankSampah = await prisma.bankSampah.findUnique({
      where: { id: bankSampahId },
    });

    if (!bankSampah) {
      return { success: false, error: "Bank sampah tidak ditemukan" };
    }

    // Check if Person with this email already exists
    let person = await prisma.person.findFirst({
      where: {
        OR: [{ email }],
      },
    });

    // If Person doesn't exist, create a new one
    if (!person) {
      const hashedPassword = await bcrypt.hash(password, 10);
      person = await prisma.person.create({
        data: {
          nama,
          nik,
          alamat,
          telepon,
          email,
          password: hashedPassword,
        },
      });
    }

    const nasabah = await prisma.nasabah.create({
      data: {
        personId: person.id,
        bankSampahId,
        saldo: 0,
        isActive: true,
      },
    });

    return {
      success: true,
      message: "Nasabah berhasil ditambahkan",
      data: { person, nasabah },
    };
  } catch (error) {
    console.error("Error adding nasabah to bank:", error);
    return { success: false, error: "Terjadi kesalahan sistem" };
  }
}

export async function updateInventarisSampah(formData: FormData) {
  try {
    const session = await getServerSession(authOptions);

    if (
      !session ||
      session.user.userType !== "controller" ||
      session.user.role !== Role.CONTROLLER
    ) {
      return { success: false, error: "Unauthorized" };
    }

    const inventarisId = formData.get("inventarisId") as string;
    const jenisSampah = formData.get("jenisSampah") as string;
    const hargaPerUnit = formData.get("hargaPerUnit") as string;
    const stokUnit = formData.get("stokUnit") as string;
    const satuan = formData.get("satuan") as string;
    const isActive = formData.get("isActive") === "true";

    if (
      !inventarisId ||
      !jenisSampah ||
      !hargaPerUnit ||
      !stokUnit ||
      !satuan
    ) {
      return { success: false, error: "Semua field wajib diisi" };
    }

    const harga = Number.parseFloat(hargaPerUnit);
    const stok = Number.parseFloat(stokUnit);

    if (isNaN(harga) || isNaN(stok) || harga <= 0 || stok <= 0) {
      return {
        success: false,
        error: "Harga dan stok harus berupa angka positif",
      };
    }

    const inventaris = await prisma.inventarisSampah.findUnique({
      where: { id: inventarisId },
    });

    if (!inventaris) {
      return { success: false, error: "Inventaris tidak ditemukan" };
    }

    const updatedInventaris = await prisma.inventarisSampah.update({
      where: { id: inventarisId },
      data: {
        jenisSampah,
        satuan,
        hargaPerUnit: harga,
        stokUnit: stok,
        isActive,
      },
    });

    return {
      success: true,
      message: "Inventaris berhasil diperbarui",
      data: updatedInventaris,
    };
  } catch (error) {
    console.error("Error updating inventaris sampah:", error);
    return { success: false, error: "Terjadi kesalahan sistem" };
  }
}

export async function addInventarisSampah(formData: FormData) {
  try {
    const session = await getServerSession(authOptions);

    if (
      !session ||
      session.user.userType !== "controller" ||
      session.user.role !== Role.CONTROLLER
    ) {
      return { success: false, error: "Unauthorized" };
    }

    const bankSampahId = formData.get("bankSampahId") as string;
    const jenisSampah = formData.get("jenisSampah") as string;
    const hargaPerUnit = formData.get("hargaPerUnit") as string;
    const stokUnit = formData.get("stokUnit") as string; // hidden = 0
    const satuan = formData.get("satuan") as string;

    if (
      !bankSampahId ||
      !jenisSampah ||
      !hargaPerUnit ||
      !stokUnit ||
      !satuan
    ) {
      return { success: false, error: "Semua field wajib diisi" };
    }

    const harga = Number.parseFloat(hargaPerUnit);
    const stok = Number.parseFloat(stokUnit);

    if (isNaN(harga) || isNaN(stok) || harga < 0 || stok < 0) {
      return {
        success: false,
        error: "Harga dan stok harus berupa angka positif",
      };
    }

    const existingInventaris = await prisma.inventarisSampah.findFirst({
      where: {
        bankSampahId,
        jenisSampah: { equals: jenisSampah, mode: "insensitive" },
        satuan,
      },
    });

    if (existingInventaris) {
      return {
        success: false,
        error: "Jenis sampah sudah ada di bank sampah ini",
      };
    }

    const newInventaris = await prisma.inventarisSampah.create({
      data: {
        bankSampahId,
        jenisSampah,
        satuan,
        hargaPerUnit: harga,
        stokUnit: stok,
        isActive: true,
      },
    });

    return {
      success: true,
      message: "Jenis sampah berhasil ditambahkan",
      data: newInventaris,
    };
  } catch (error) {
    console.error("Error adding inventaris sampah:", error);
    return { success: false, error: "Terjadi kesalahan sistem" };
  }
}

export async function updateBankSampahCoordinate(
  bankSampahId: string,
  latitude: number,
  longitude: number,
) {
  try {
    const session = await getServerSession(authOptions);

    if (
      !session ||
      session.user.userType !== "controller" ||
      session.user.role !== Role.CONTROLLER
    ) {
      return { success: false, error: "Unauthorized" };
    }

    const bankSampah = await prisma.bankSampah.findUnique({
      where: { id: bankSampahId },
    });

    if (!bankSampah) {
      return { success: false, error: "Bank sampah tidak ditemukan" };
    }

    const updatedBankSampah = await prisma.bankSampah.update({
      where: { id: bankSampahId },
      data: {
        latitude,
        longitude,
      },
    });

    return {
      success: true,
      message: "Koordinat berhasil diperbarui",
      data: updatedBankSampah,
    };
  } catch (error) {
    console.error("Error updating bank sampah coordinate:", error);
    return { success: false, error: "Terjadi kesalahan sistem" };
  }
}

export async function getBankSampahTransaksi(
  bankSampahId: string,
  page: number = 1,
  itemsPerPage: number = 20,
) {
  try {
    const skip = (page - 1) * itemsPerPage;

    const totalTransaksi = await prisma.transaksi.count({
      where: { bankSampahId },
    });

    const transaksi = await prisma.transaksi.findMany({
      where: { bankSampahId },
      include: {
        nasabah: { select: { person: { select: { nama: true } } } },
        detailTransaksi: {
          include: {
            inventarisSampah: {
              select: {
                jenisSampah: true,
                satuan: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: itemsPerPage,
    });

    const totalPages = Math.ceil(totalTransaksi / itemsPerPage);

    return {
      success: true,
      data: {
        transaksi,
        currentPage: page,
        totalPages,
        totalItems: totalTransaksi,
      },
    };
  } catch (error) {
    console.error("Error fetching transaksi:", error);
    return { success: false, error: "Gagal mengambil data transaksi" };
  }
}
