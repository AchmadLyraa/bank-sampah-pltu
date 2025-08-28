import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { getDashboardData } from "@/app/actions/bank-sampah";
import DashboardStats from "@/components/dashboard-stats";
import RecentTransactions from "@/components/recent-transactions";
import QuickActions from "@/components/quick-actions";
import LayoutWrapper from "@/components/layout-wrapper";
import Image from "next/image";

export default async function BankSampahDashboard() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.userType !== "bank-sampah") {
    redirect("/");
  }

  const data = await getDashboardData(session.user.id);

  return (
    <LayoutWrapper userType="bank-sampah" userName={session.user.name || ""}>
      <div className="max-w-7xl mx-auto py-6 px-4">
        <div className="mb-8">
          <div className="block md:hidden mb-4">
            <Image src="/logo-2.png" alt="Logo" width={250} height={250} />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            <span className="hidden md:inline">Dashboard</span>{" "}
            {session.user.name || "unknown"}
          </h1>
          <p className="text-gray-600">Kelola nasabah dan transaksi sampah</p>
        </div>

        <DashboardStats data={data} />
        <QuickActions />
        <RecentTransactions transactions={data.recentTransaksi} />
      </div>
    </LayoutWrapper>
  );
}
