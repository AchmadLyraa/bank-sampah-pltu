import { cookies } from "next/headers";
import type { Role } from "@/types";

export type SessionData =
  | {
      type: "bank-sampah";
      data: {
        userId: string;
        userType: "bank-sampah";
        email: string;
        nama: string;
      };
    }
  | {
      type: "controller";
      data: {
        id: string;
        email: string;
        nama: string;
        role: Role;
      };
    }
  | {
      type: "nasabah";
      data: {
        personId: string;
        userType: "nasabah";
        email: string;
        nama: string;
        bankSampahRelationships: Array<{
          nasabahId: string;
          bankSampahId: string;
          bankSampahNama: string;
          saldo: number;
        }>;
        selectedBankSampahId: string;
      };
    };

export async function getSession(): Promise<SessionData | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session");

  if (!sessionCookie) return null;

  try {
    return JSON.parse(sessionCookie.value);
  } catch {
    return null;
  }
}
