import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import LayoutWrapper from "@/components/layout-wrapper";
import GeneralTransactionForm from "@/components/general-transaction-form";
import Image from "next/image";

export default async function LaporanPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.userType !== "bank-sampah") {
    redirect("/");
  }

  const bankSampahId = session.user.id;

  return (
    <LayoutWrapper userType="bank-sampah" userName={session.user.name || ""}>
      <div className="max-w-4xl mx-auto py-6 px-4 space-y-6">
        <div className="block md:hidden mb-4">
          <Image src="/logo-2.png" alt="Logo" width={250} height={250} />
        </div>
        <h1 className="text-2xl font-bold">Transaksi Bank Sampah</h1>

        <GeneralTransactionForm bankSampahId={bankSampahId} />
      </div>
    </LayoutWrapper>
  );
}
