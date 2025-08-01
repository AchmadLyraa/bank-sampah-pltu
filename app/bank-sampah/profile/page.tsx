import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import LayoutWrapper from "@/components/layout-wrapper";
import EditBankSampahProfileForm from "@/components/edit-bank-sampah-profile-form";

export default async function BankSampahProfilePage() {
  const session = await getSession();

  if (!session || session.userType !== "bank-sampah") {
    redirect("/");
  }

  const bankSampah = await prisma.bankSampah.findUnique({
    where: { id: session.userId },
    select: { id: true, nama: true, email: true, telepon: true, alamat: true },
  });

  if (!bankSampah) {
    redirect("/");
  }

  return (
    <LayoutWrapper userType="bank-sampah" userName={session.nama}>
      <div className="max-w-4xl mx-auto py-6 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Profil Bank Sampah
          </h1>
          <p className="text-gray-600">Kelola informasi profil Anda</p>
        </div>
        <EditBankSampahProfileForm bankSampah={bankSampah} />
      </div>
    </LayoutWrapper>
  );
}
