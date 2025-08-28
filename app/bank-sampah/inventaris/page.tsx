import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";
import InventarisTable from "@/components/inventaris-table";
import TambahInventarisModal from "@/components/tambah-inventaris-modal";
import LayoutWrapper from "@/components/layout-wrapper";
import Image from "next/image";

export default async function InventarisPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.userType !== "bank-sampah") {
    redirect("/");
  }

  const inventaris = await prisma.inventarisSampah.findMany({
    where: { bankSampahId: session.user.id },
    orderBy: { jenisSampah: "asc" },
  });

  return (
    <LayoutWrapper
      userType="bank-sampah"
      userName={session.user.name || "Unknown"}
    >
      <div className="max-w-6xl mx-auto py-6 px-4">
        <div className="mb-8 flex sm:items-center items-start justify-between sm:flex-row flex-col">
          <div className="mb-4 sm:mb-0">
            <div className="block md:hidden mb-4">
              <Image src="/logo-2.png" alt="Logo" width={250} height={250} />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">
              Inventaris Sampah
            </h1>
            <p className="text-gray-600">
              Kelola jenis sampah dan harga per kilogram
            </p>
          </div>

          {/* Modal Trigger Button */}
          <TambahInventarisModal bankSampahId={session.user.id} />
        </div>

        <InventarisTable inventaris={inventaris} />
      </div>
    </LayoutWrapper>
  );
}
