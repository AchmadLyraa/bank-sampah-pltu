import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { redirect } from "next/navigation";
import LayoutWrapper from "@/components/layout-wrapper";
import { BankSampahMap } from "@/components/bank-sampah-map";

export default async function BankSampahMapPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.userType !== "controller") {
    redirect("/");
  }

  return (
    <LayoutWrapper
      userType="controller"
      userName={session.user.name || "Unknown"}
    >
      <div className="max-w-5xl mx-auto py-6 px-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Peta Bank Sampah</h1>
          <p className="text-gray-600">
            Lokasi semua bank sampah yang terdaftar
          </p>
        </div>

        <BankSampahMap />
      </div>
    </LayoutWrapper>
  );
}
