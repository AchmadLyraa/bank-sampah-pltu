"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { Role } from "@/types";
import bcrypt from "bcryptjs";
import { isEmailUnique } from "@/lib/email-validator";

export async function getBankSampahList() {
  try {
    const session = await getSession();

    if (
      !session ||
      session.userType !== "controller" ||
      session.role !== Role.CONTROLLER
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

export async function createBankSampah(formData: FormData) {
  try {
    const session = await getSession();

    if (
      !session ||
      session.userType !== "controller" ||
      session.role !== Role.CONTROLLER
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

    // Check if email already exists
    const emailIsUnique = await isEmailUnique(email);
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
    const session = await getSession();

    if (
      !session ||
      session.userType !== "controller" ||
      session.role !== Role.CONTROLLER
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
    const session = await getSession();

    if (
      !session ||
      session.userType !== "controller" ||
      session.role !== Role.CONTROLLER
    ) {
      return { success: false, error: "Unauthorized" };
    }

    const nama = formData.get("nama") as string;
    // const email = formData.get("email") as string;

    if (!nama) {
      return { success: false, error: "Nama wajib diisi" };
    }

    // Check if email already exists for other controllers
    // const emailIsUnique = await isEmailUnique(
    //   email,
    //   session.userId,
    //   "controller",
    // );
    // if (!emailIsUnique) {
    //   return { success: false, error: "Email sudah digunakan di sistem" };
    // }

    const updatedController = await prisma.controller.update({
      where: { id: session.userId },
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
    const session = await getSession();

    if (
      !session ||
      session.userType !== "controller" ||
      session.role !== Role.CONTROLLER
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
    });

    // Get transaction count
    const totalTransaksi = await prisma.transaksi.count({
      where: { bankSampahId },
    });

    // Calculate statistics
    const totalNasabah = nasabahDetails.length;
    const nasabahAktif = nasabahDetails.filter((n) => n.isActive).length;
    const nasabahNonaktif = totalNasabah - nasabahAktif;
    const totalSaldo = nasabahDetails.reduce((sum, n) => sum + n.saldo, 0);
    const totalInventaris = inventaris.length;

    // Format nasabah details for display
    const formattedNasabahDetails = nasabahDetails.map((nasabah) => ({
      id: nasabah.id,
      nama: nasabah.person.nama,
      email: nasabah.person.email,
      saldo: nasabah.saldo,
      isActive: nasabah.isActive,
    }));

    const data = {
      bankSampah,
      statistics: {
        totalNasabah,
        nasabahAktif,
        nasabahNonaktif,
        totalSaldo,
        totalInventaris,
        totalTransaksi,
      },
      nasabahDetails: formattedNasabahDetails,
      inventaris,
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
    const session = await getSession();

    if (
      !session ||
      session.userType !== "controller" ||
      session.role !== Role.CONTROLLER
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

export async function getBankSampahListPaginated(
  page = 1,
  search = "",
  limit = 10,
) {
  try {
    const session = await getSession();

    if (
      !session ||
      session.userType !== "controller" ||
      session.role !== Role.CONTROLLER
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
    const session = await getSession();

    if (
      !session ||
      session.userType !== "controller" ||
      session.role !== Role.CONTROLLER
    ) {
      return { success: false, error: "Unauthorized" };
    }

    // Calculate date range based on filter
    let startDate: Date;
    const endDate = new Date();

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
        startDate = new Date("2020-01-01"); // Far back date
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

export async function resetUserPassword(formData: FormData) {
  try {
    const session = await getSession();

    if (
      !session ||
      session.userType !== "controller" ||
      session.role !== Role.CONTROLLER
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
