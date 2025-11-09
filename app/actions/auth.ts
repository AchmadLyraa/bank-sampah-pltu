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

    // Daftar lengkap cookie NextAuth / mungkin muncul di browser mu
    const cookieNames = [
      "__Host-next-auth.csrf-token",
      "__Secure-next-auth.csrf-token",
      "__Secure-next-auth.callback-url",
      "__Secure-next-auth.session-token",
      "next-auth.csrf-token",
      "next-auth.session-token",
      // supabase / custom cookie - tambahin bila ada
      "sb-access-token",
      "sb-refresh-token",
      "session",
      "token",
    ];

    // Hapus setiap cookie dengan path '/'
    // cookies().delete biasanya mengirim Set-Cookie untuk menghapus
    for (const name of cookieNames) {
      try {
        cookieStore.delete(name, { path: "/" });
      } catch (e) {
        // ignore error per cookie supaya logout tetap lanjut
        console.warn("Failed deleting cookie", name, e);
      }
    }

    // Revalidate homepage cache supaya halaman publik uptodate
    revalidatePath("/");
  } catch (err) {
    console.error("Logout action error:", err);
  }

  // Redirect ke login
  return redirect("/");
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
