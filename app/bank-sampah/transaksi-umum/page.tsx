import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import LayoutWrapper from "@/components/layout-wrapper";
import GeneralTransactionForm from "@/components/general-transaction-form";

export default async function LaporanPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.userType !== "bank-sampah") {
    redirect("/");
  }

  const bankSampahId = session.user.id;

  return (
    <LayoutWrapper userType="bank-sampah" userName={session.user.name || ""}>
      <div className="max-w-4xl mx-auto py-6 px-4 space-y-6">
        <h1 className="text-2xl font-bold">Laporan Bank Sampah</h1>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Tambah Transaksi Umum</h2>
          <GeneralTransactionForm bankSampahId={bankSampahId} />
        </div>
      </div>
    </LayoutWrapper>
  );
}
