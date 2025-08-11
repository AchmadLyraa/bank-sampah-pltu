"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { authenticateUser } from "@/lib/auth";
import type { NasabahSession } from "@/types"; // 🆕 Import NasabahSession

// Update loginAction to remove userType parameter
export async function loginAction(formData: FormData) {
  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const result = await authenticateUser(data);

  if (!result) {
    return { error: "Email atau password salah" };
  }

  if ("error" in result) {
    return { error: result.error };
  }

  // Set session cookie
  const cookieStore = await cookies();
  if (result.type === "bank-sampah") {
    cookieStore.set(
      "session",
      JSON.stringify({
        userId: result.user.id,
        userType: result.type,
        email: result.user.email,
        nama: result.user.nama,
      }),
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 7, // 7 days
      },
    );
    redirect("/bank-sampah");
  } else {
    // 🆕 For nasabah, store personId, all relationships, and selected bank sampah
    const sessionData: NasabahSession = {
      personId: result.person.id,
      userType: "nasabah",
      email: result.person.email,
      nama: result.person.nama,
      bankSampahRelationships: result.nasabahRelationships,
      selectedBankSampahId: result.nasabahRelationships[0].bankSampahId, // Default to the first one
    };

    cookieStore.set("session", JSON.stringify(sessionData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });
    redirect("/nasabah");
  }
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete("session");
  redirect("/");
}

// 🆕 NEW: Server Action to update the selected bank sampah for a nasabah
export async function updateSelectedBankSampahAction(bankSampahId: string) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session");

  if (!sessionCookie) {
    return { error: "Sesi tidak ditemukan" };
  }

  try {
    const session: NasabahSession = JSON.parse(sessionCookie.value);

    if (session.userType !== "nasabah") {
      return { error: "Tipe pengguna tidak valid" };
    }

    // Validate if the selected bankSampahId is actually one of the user's relationships
    const isValidSelection = session.bankSampahRelationships.some(
      (rel) => rel.bankSampahId === bankSampahId,
    );

    if (!isValidSelection) {
      return { error: "Pilihan bank sampah tidak valid" };
    }

    session.selectedBankSampahId = bankSampahId;

    cookieStore.set("session", JSON.stringify(session), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return { success: true };
  } catch (error) {
    console.error("Error updating selected bank sampah:", error);
    return { error: "Gagal memperbarui bank sampah yang dipilih" };
  }
}
