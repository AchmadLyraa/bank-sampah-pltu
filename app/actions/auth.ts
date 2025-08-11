"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { authenticateUser, authenticateController } from "@/lib/auth"; // Import authenticateController
import type { NasabahSession } from "@/types";

// Update loginAction to remove userType parameter
export async function loginAction(formData: FormData) {
  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  }

  // First try to authenticate as user (bank-sampah or nasabah)
  const userResult = await authenticateUser(data)

  if (userResult && !("error" in userResult)) {
    const cookieStore = await cookies()

    if (userResult.type === "bank-sampah") {
      cookieStore.set(
        "session",
        JSON.stringify({
          userId: userResult.user.id,
          userType: userResult.type,
          email: userResult.user.email,
          nama: userResult.user.nama,
        }),
        {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          maxAge: 60 * 60 * 24 * 7, // 7 days
        },
      )
      redirect("/bank-sampah")
    } else {
      // For nasabah, store personId, all relationships, and selected bank sampah
      const sessionData: NasabahSession = {
        personId: userResult.person.id,
        userType: "nasabah",
        email: userResult.person.email,
        nama: userResult.person.nama,
        bankSampahRelationships: userResult.nasabahRelationships,
        selectedBankSampahId: userResult.nasabahRelationships[0].bankSampahId, // Default to the first one
      }

      cookieStore.set("session", JSON.stringify(sessionData), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 7, // 7 days
      })
      redirect("/nasabah")
    }
  }

  // If user authentication failed, try controller authentication
  const controllerResult = await authenticateController(data)

  if (controllerResult) {
    const cookieStore = await cookies()

    cookieStore.set(
      "session",
      JSON.stringify({
        userId: controllerResult.id,
        userType: "controller",
        email: controllerResult.email,
        nama: controllerResult.nama,
        role: controllerResult.role,
      }),
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 7, // 7 days
      },
    )
    redirect("/controller")
  }

  // If both authentications failed, check if there was a specific error from user auth
  if (userResult && "error" in userResult) {
    return { error: userResult.error }
  }

  return { error: "Email atau password salah" }
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
