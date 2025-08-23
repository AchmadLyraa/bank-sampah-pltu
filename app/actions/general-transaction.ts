"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";

export async function createGeneralTransaction(formData: FormData) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.userType !== "bank-sampah") {
    return { error: "Unauthorized" };
  }

  const bankSampahId = formData.get("bankSampahId")?.toString();
  const jenis = formData.get("jenis")?.toString() as
    | "PEMASUKAN_UMUM"
    | "PENGELUARAN_UMUM";
  const totalNilai = Number.parseFloat(formData.get("totalNilai") as string);
  const keterangan = formData.get("keterangan")?.toString();

  if (!bankSampahId || !jenis || !totalNilai || !keterangan) {
    return { error: "Data tidak lengkap" };
  }

  if (bankSampahId !== session.user.id) {
    return { error: "Unauthorized" };
  }

  try {
    await prisma.transaksi.create({
      data: {
        jenis,
        totalNilai,
        keterangan,
        bankSampahId,
      },
    });

    revalidatePath("/bank-sampah/laporan");
    return { success: true, message: "Transaksi berhasil ditambahkan!" };
  } catch (error) {
    console.error("Error createGeneralTransaction:", error);
    return { error: "Gagal membuat transaksi umum" };
  }
}
