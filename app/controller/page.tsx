import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { redirect } from "next/navigation";
import LayoutWrapper from "@/components/layout-wrapper";
import { BankSampahListWithCharts } from "@/components/bank-sampah-list-with-charts";
import Image from "next/image";

export default async function ControllerPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.userType !== "controller") {
    redirect("/");
  }

  return (
    <LayoutWrapper userType="controller" userName={session.user.name || ""}>
      <div className="max-w-7xl mx-auto py-6 px-4">
        <div className="mb-8">
          <div className="block md:hidden mb-4">
            <Image src="/logo-2.png" alt="Logo" width={250} height={250} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            Dashboard Controller
          </h1>
          <p className="text-gray-600">
            Kelola bank sampah dan lihat grafik keuntungan individual
          </p>
        </div>

        <BankSampahListWithCharts />
      </div>{" "}
    </LayoutWrapper>
  );
}
