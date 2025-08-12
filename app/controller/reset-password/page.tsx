import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import LayoutWrapper from "@/components/layout-wrapper";
import { ResetPasswordForm } from "@/components/reset-password-form";

export default async function ResetPasswordPage() {
  const session = await getSession();

  if (!session || session.userType !== "controller") {
    redirect("/");
  }

  return (
    <LayoutWrapper userType="controller" userName={session.nama}>
      <div className="max-w-4xl mx-auto py-6 px-4">
        <div className="mb-8">
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
