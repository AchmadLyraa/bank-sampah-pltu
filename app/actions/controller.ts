"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { Role } from "@/types";
import bcrypt from "bcryptjs";

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
    const existingBankSampah = await prisma.bankSampah.findUnique({
      where: { email },
    });

    if (existingBankSampah) {
      return { success: false, error: "Email sudah terdaftar" };
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
    const email = formData.get("email") as string;

    if (!nama || !email) {
      return { success: false, error: "Nama dan email wajib diisi" };
    }

    // Check if email already exists for other controllers
    const existingController = await prisma.controller.findFirst({
      where: {
        email,
        id: { not: session.userId },
      },
    });

    if (existingController) {
      return {
        success: false,
        error: "Email sudah digunakan oleh controller lain",
      };
    }

    const updatedController = await prisma.controller.update({
      where: { id: session.userId },
      data: { nama, email },
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
