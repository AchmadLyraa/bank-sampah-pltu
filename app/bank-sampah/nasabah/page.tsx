import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { getNasabahList } from "@/app/actions/nasabah-management";
import LayoutWrapper from "@/components/layout-wrapper";
import NasabahListWithSearch from "@/components/nasabah-list-with-search";
import TambahNasabahModal from "@/components/tambah-nasabah-modal";

export default async function NasabahPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.userType !== "bank-sampah") {
    redirect("/");
  }

  const nasabahList = await getNasabahList(session.user.id, true);
  return (
    <LayoutWrapper
      userType="bank-sampah"
      userName={session.user.name || "Unknown"}
    >
      <div className="max-w-6xl mx-auto py-6 px-4">
        <div className="mb-8 flex items-center justify-between flex-wrap">
          <div className="flex-[100%] sm:flex-1 sm:mb-0 mb-4">
            <h1 className="text-3xl font-bold text-gray-900">Kelola Nasabah</h1>
            <p className="text-gray-600">
              Daftar nasabah dan tambah nasabah baru
            </p>
          </div>

          {/* Modal Trigger Button */}
          <TambahNasabahModal bankSampahId={session.user.id} />
        </div>
        {/* List Nasabah with Search */}
        <NasabahListWithSearch nasabahList={nasabahList} />
      </div>
    </LayoutWrapper>
  );
}
