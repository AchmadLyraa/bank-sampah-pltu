import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { redirect } from "next/navigation";
import LayoutWrapper from "@/components/layout-wrapper";
import InventarisAlatForm from "@/components/inventaris-alat-form";
import InventarisAlatPageClient from "@/components/inventaris-alat-client";
import Image from "next/image";

export default async function InventarisPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.userType !== "bank-sampah") {
    redirect("/");
  }

  return (
    <LayoutWrapper userType="bank-sampah" userName={session.user.name || ""}>
      <div className="block md:hidden mb-4">
        <Image src="/logo-2.png" alt="Logo" width={250} height={250} />
      </div>
      <InventarisAlatPageClient
        bankSampahId={session.user.id}
        userName={session.user.name || ""}
      />
    </LayoutWrapper>
  );
}
