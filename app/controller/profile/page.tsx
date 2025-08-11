import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import LayoutWrapper from "@/components/layout-wrapper";
import EditControllerProfileForm from "@/components/edit-controller-profile-form";

export default async function ControllerProfilePage() {
  const session = await getSession();

  if (!session || session.userType !== "controller") {
    redirect("/");
  }

  const controller = await prisma.controller.findUnique({
    where: { id: session.userId },
    select: { id: true, nama: true, email: true },
  });

  if (!controller) {
    redirect("/");
  }

  return (
    <LayoutWrapper userType="controller" userName={session.nama}>
      <div className="max-w-4xl mx-auto py-6 px-4">
        <div className="mb-8">
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
