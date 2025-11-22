import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { getNasabahDashboardData } from "@/app/actions/nasabah";
import LayoutWrapper from "@/components/layout-wrapper";
import NasabahDashboard from "@/components/nasabah-dashboard";
import Image from "next/image";

export default async function NasabahPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.userType !== "nasabah") {
    redirect("/api/auth/signout?callbackUrl=/");
  }

  const selectedBankSampahId =
    session.user.activeBankSampahId ||
    session.user.bankSampahRelations?.[0]?.bankSampahId;

  if (!selectedBankSampahId) {
    redirect("/api/auth/signout?callbackUrl=/");
  }

  const { nasabah, transaksi, inventarisList, error } =
    await getNasabahDashboardData(session.user.personId!, selectedBankSampahId);

  if (error) {
    console.error("Error fetching nasabah dashboard data:", error);
    redirect("/");
  }

  if (!nasabah) {
    // This should ideally not happen if error is handled, but as a fallback
    return (
      <LayoutWrapper userType="nasabah" userName={session.user.name || ""}>
        <div className="max-w-4xl mx-auto py-6 px-4 text-center text-gray-500">
          <p>Data nasabah tidak ditemukan untuk bank sampah yang dipilih.</p>
          <p>Silakan coba login kembali atau hubungi admin.</p>
        </div>
      </LayoutWrapper>
    );
  }

  return (
    <LayoutWrapper userType="nasabah" userName={session.user.name || ""}>
      <div className="max-w-4xl mx-auto py-6 px-4">
        <div className="block md:hidden mb-4">
          <Image src="/logo-2.png" alt="Logo" width={250} height={250} />
        </div>
        <NasabahDashboard
          nasabah={nasabah}
          transaksi={transaksi}
          inventarisList={inventarisList}
          bankSampahRelationships={session.user.bankSampahRelations || []}
          selectedBankSampahId={selectedBankSampahId}
        />
      </div>
    </LayoutWrapper>
  );
}
