import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { getLaporanPendapatan } from "@/app/actions/laporan";
import LayoutWrapper from "@/components/layout-wrapper";
import LaporanClient from "@/components/laporan-client"; // 🆕 Import client component
import Image from "next/image";

export default async function LaporanPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.userType !== "bank-sampah") {
    redirect("/");
  }

  // 🚀 Fetch initial data on the server
  const initialLaporanData = await getLaporanPendapatan(session.user.id);

  return (
    <LayoutWrapper
      userType="bank-sampah"
      userName={session.user.name || "Unknown"}
    >
      <div className="max-w-7xl mx-auto py-6 px-4">
        <div className="mb-8">
          <div className="block md:hidden mb-4">
            <Image src="/logo-2.png" alt="Logo" width={250} height={250} />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            📊 Laporan Pendapatan
          </h1>
          <p className="text-gray-600">
            Analisis pendapatan dari sampah masuk dan keluar dengan filter
            tanggal
          </p>
        </div>

        {/* 🆕 Pass initial data and userId to client component */}
        <LaporanClient
          initialData={initialLaporanData}
          bankSampahId={session.user.id || "Unknown"}
        />
      </div>
    </LayoutWrapper>
  );
}
