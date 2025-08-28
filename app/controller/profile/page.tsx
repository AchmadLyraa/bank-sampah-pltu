import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";
import LayoutWrapper from "@/components/layout-wrapper";
import EditControllerProfileForm from "@/components/edit-controller-profile-form";
import Image from "next/image";

export default async function ControllerProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.userType !== "controller") {
    redirect("/");
  }

  const controller = await prisma.controller.findUnique({
    where: { id: session.user.id },
    select: { id: true, nama: true, email: true },
  });

  if (!controller) {
    redirect("/");
  }

  return (
    <LayoutWrapper
      userType="controller"
      userName={session.user.name || "Unknown"}
    >
      <div className="max-w-4xl mx-auto py-6 px-4">
        <div className="mb-8">
          <div className="block md:hidden mb-4">
            <Image src="/logo-2.png" alt="Logo" width={250} height={250} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            Profil Controller
          </h1>
          <p className="text-gray-600">Kelola informasi profil Anda</p>
        </div>
        <EditControllerProfileForm controller={controller} />
      </div>
    </LayoutWrapper>
  );
}
