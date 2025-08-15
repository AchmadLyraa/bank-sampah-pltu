import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";
import PenarikanForm from "@/components/penarikan-form";
import LayoutWrapper from "@/components/layout-wrapper";

export default async function PenarikanPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.userType !== "bank-sampah") {
    redirect("/");
  }

  const nasabahList = await prisma.nasabah.findMany({
    where: {
      bankSampahId: session.user.id,
      saldo: { gt: 0 },
      isActive: true, // 🎯 ONLY ACTIVE NASABAH
    },
    include: {
      person: true, // 🆕 Include Person data
    },
    orderBy: {
      person: { nama: "asc" }, // 🔧 FIXED: Sort by person's name
    },
  });

  return (
    <LayoutWrapper
      userType="bank-sampah"
      userName={session.user.name || "Unknown"}
    >
      <div className="max-w-4xl mx-auto py-6 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Penarikan Saldo</h1>
          <p className="text-gray-600">Proses penarikan saldo nasabah</p>
        </div>

        <PenarikanForm nasabahList={nasabahList} />
      </div>
    </LayoutWrapper>
  );
}
