"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function logoutAction() {
  try {
    const cookieStore = cookies();

    // Clear NextAuth session cookies
    cookieStore.delete("next-auth.session-token");
    cookieStore.delete("__Secure-next-auth.session-token");
    cookieStore.delete("next-auth.csrf-token");
    cookieStore.delete("__Host-next-auth.csrf-token");

    // Clear any custom session cookies if they exist
    cookieStore.delete("session");

    revalidatePath("/");
  } catch (error) {
    console.error("Logout error:", error);
  }

  redirect("/");
}

export async function updateSelectedBankSampahAction(bankSampahId: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.userType !== "nasabah") {
      return { error: "Sesi tidak valid atau tipe pengguna salah" };
    }

    // Validate selection
    const isValidSelection = session.user.bankSampahRelations?.some(
      (rel: any) => rel.bankSampahId === bankSampahId,
    );
    if (!isValidSelection) {
      return { error: "Pilihan bank sampah tidak valid" };
    }

    // SKIP DATABASE UPDATE - LANGSUNG SUCCESS AJA
    revalidatePath("/nasabah");

    return {
      success: true,
      newBankSampahId: bankSampahId,
    };
  } catch (error) {
    console.error("Error updating selected bank sampah:", error);
    return { error: "Gagal memperbarui bank sampah yang dipilih" };
  }
}

export async function getCurrentSession() {
  return await getServerSession(authOptions);
}

export async function requireAuth() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/");
  }
  return session;
}

export async function requireUserType(userType: string) {
  const session = await requireAuth();
  if (session.user.userType !== userType) {
    redirect("/");
  }
  return session;
}
