import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
// import { ControllerDashboard } from "@/components/controller-dashboard";
import LayoutWrapper from "@/components/layout-wrapper";
import { BankSampahListWithCharts } from "@/components/bank-sampah-list-with-charts";

export default async function ControllerPage() {
  const session = await getSession();

  if (!session || session.userType !== "controller") {
    redirect("/");
  }

  return (
    <LayoutWrapper userType="controller" userName={session.nama}>
      <div className="max-w-7xl mx-auto py-6 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            📊 Dashboard Controller
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
