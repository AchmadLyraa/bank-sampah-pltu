import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { redirect } from "next/navigation";

export async function getSession() {
  return await getServerSession(authOptions);
}

export async function requireSession() {
  const session = await getSession();
  if (!session?.user) {
    redirect("/");
  }
  return session;
}

export async function requireBankSampah() {
  const session = await requireSession();
  if (session.user.userType !== "bank-sampah") {
    redirect("/");
  }
  return session;
}

export async function requireNasabah() {
  const session = await requireSession();
  if (session.user.userType !== "nasabah") {
    redirect("/");
  }
  return session;
}

export async function requireController() {
  const session = await requireSession();
  if (session.user.userType !== "controller") {
    redirect("/");
  }
  return session;
}
