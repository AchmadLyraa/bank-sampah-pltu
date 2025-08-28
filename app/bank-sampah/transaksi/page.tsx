import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";
import TransaksiTable from "@/components/transaksi-table";
import LayoutWrapper from "@/components/layout-wrapper";
import Image from "next/image";

interface TransaksiPageProps {
  searchParams: { page?: string };
}

export default async function TransaksiPage({
  searchParams,
}: TransaksiPageProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.userType !== "bank-sampah") {
    redirect("/");
  }

  // 📄 Pagination setup
  const currentPage = Number(searchParams.page) || 1;
  const itemsPerPage = 20;
  const skip = (currentPage - 1) * itemsPerPage;

  // 📊 Get total count for pagination
  const totalTransaksi = await prisma.transaksi.count({
    where: { bankSampahId: session.user.id },
  });

  const totalPages = Math.ceil(totalTransaksi / itemsPerPage);

  // 📋 Get paginated transaksi
  const transaksi = await prisma.transaksi.findMany({
    where: { bankSampahId: session.user.id },
    include: {
      nasabah: { select: { person: { select: { nama: true } } } },
      detailTransaksi: {
        include: {
          inventarisSampah: { select: { jenisSampah: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
    skip,
    take: itemsPerPage,
  });

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
            Riwayat Transaksi
          </h1>
          <p className="text-gray-600">Semua transaksi bank sampah</p>
        </div>

        <TransaksiTable
          transaksi={transaksi}
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalTransaksi}
        />
      </div>
    </LayoutWrapper>
  );
}
