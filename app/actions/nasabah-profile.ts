"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";

export async function updateNasabahProfileAction(formData: FormData) {
  const personId = formData.get("personId") as string; // Now operating on Person ID
  const alamat = formData.get("alamat") as string;
  const nik = formData.get("nik") as string;
  const telepon = formData.get("telepon") as string;

  try {
    // Update alamat dan telepon
    await prisma.person.update({
      where: { id: personId },
      data: {
        alamat,
        telepon,
        nik,
      },
    });

    revalidatePath("/nasabah");
    revalidatePath("/bank-sampah/nasabah");
    return { success: true, message: "Profil berhasil diperbarui!" };
  } catch (error) {
    console.error("Error updating profile:", error);
    return { error: "Terjadi kesalahan saat memperbarui profil" };
  }
}

export async function changeNasabahPasswordAction(formData: FormData) {
  const personId = formData.get("personId") as string; // Now operating on Person ID
  const currentPassword = formData.get("currentPassword") as string;
  const newPassword = formData.get("newPassword") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  try {
    // Validasi password baru
    if (newPassword !== confirmPassword) {
      return { error: "Password baru dan konfirmasi password tidak sama" };
    }

    if (newPassword.length < 6) {
      return { error: "Password baru minimal 6 karakter" };
    }

    // Cek password lama di model Person
    const person = await prisma.person.findUnique({
      where: { id: personId },
    });

    if (!person) {
      return { error: "Individu tidak ditemukan" };
    }

    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      person.password,
    );
    if (!isCurrentPasswordValid) {
      return { error: "Password lama tidak benar" };
    }

    // Hash password baru
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Update password di model Person
    await prisma.person.update({
      where: { id: personId },
      data: {
        password: hashedNewPassword,
      },
    });

    revalidatePath("/nasabah");
    return { success: true, message: "Password berhasil diubah!" };
  } catch (error) {
    console.error("Error changing password:", error);
    return { error: "Terjadi kesalahan saat mengubah password" };
  }
}
