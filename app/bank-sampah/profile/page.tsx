import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";
import LayoutWrapper from "@/components/layout-wrapper";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Lock } from "lucide-react";
import EditBankSampahProfileForm from "@/components/edit-bank-sampah-profile-form";
import ChangeBankSampahPasswordForm from "@/components/change-bank-sampah-password-form";
import Image from "next/image";

export default async function BankSampahProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.userType !== "bank-sampah") {
    redirect("/api/auth/signout?callbackUrl=/");
  }

  const bankSampah = await prisma.bankSampah.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      nama: true,
      email: true,
      telepon: true,
      alamat: true,
      latitude: true,
      longitude: true,
    },
  });

  if (!bankSampah) {
    redirect("/api/auth/signout?callbackUrl=/");
  }

  return (
    <LayoutWrapper
      userType="bank-sampah"
      userName={session.user.name || "Unknown"}
    >
      <div className="max-w-4xl mx-auto py-6 px-4">
        <div className="mb-8">
          <div className="block md:hidden mb-4">
            <Image src="/logo-2.png" alt="Logo" width={250} height={250} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            Profil Bank Sampah
          </h1>
          <p className="text-gray-600">
            Kelola informasi profil dan keamanan akun Anda
          </p>
        </div>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Profil
            </TabsTrigger>
            <TabsTrigger value="password" className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              Password
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-4">
            <EditBankSampahProfileForm bankSampah={bankSampah} />
          </TabsContent>

          <TabsContent value="password" className="space-y-4">
            <ChangeBankSampahPasswordForm bankSampah={bankSampah} />
          </TabsContent>
        </Tabs>
      </div>
    </LayoutWrapper>
  );
}

// export async function updateSession(
//   newSessionData: SessionData,
// ): Promise<void> {
//   const cookieStore = await cookies();

//   cookieStore.set("session", JSON.stringify(newSessionData), {
//     httpOnly: true,
//     secure: process.env.NODE_ENV === "production",
//     sameSite: "lax",
//     maxAge: 60 * 60 * 24 * 7, // 7 days
//   });
// }
