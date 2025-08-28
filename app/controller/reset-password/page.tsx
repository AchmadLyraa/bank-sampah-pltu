import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { redirect } from "next/navigation";
import LayoutWrapper from "@/components/layout-wrapper";
import { ResetPasswordForm } from "@/components/reset-password-form";
import Image from "next/image";

export default async function ResetPasswordPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.userType !== "controller") {
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
          <h1 className="text-2xl font-bold text-gray-900">Reset Password</h1>
          <p className="text-gray-600">
            Reset password untuk nasabah atau bank sampah yang lupa password
          </p>
        </div>

        <ResetPasswordForm />
      </div>
    </LayoutWrapper>
  );
}
