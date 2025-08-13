import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import LayoutWrapper from "@/components/layout-wrapper";
import { BankSampahMap } from "@/components/bank-sampah-map";

export default async function BankSampahMapPage() {
  const session = await getSession();

  if (!session || session.userType !== "controller") {
    redirect("/");
  }

  return (
    <LayoutWrapper userType="controller" userName={session.nama || "Unknown"}>
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
