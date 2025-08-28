import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { redirect } from "next/navigation";
import LayoutWrapper from "@/components/layout-wrapper";
import { BankSampahList } from "@/components/bank-sampah-list";
import Image from "next/image";

export default async function ControllerBankSampahPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.userType !== "controller") {
    redirect("/");
  }

  return (
    <LayoutWrapper
      userType="controller"
      userName={session.user.name || "Unknown"}
    >
      {" "}
      <div className="p-6">
        <div className="mb-6">
          <div className="block md:hidden mb-4">
            <Image src="/logo-2.png" alt="Logo" width={250} height={250} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            Kelola Bank Sampah
          </h1>
          <p className="text-gray-600">
            Daftar semua bank sampah yang terdaftar
          </p>
        </div>
        <BankSampahList />
      </div>
    </LayoutWrapper>
  );
}
