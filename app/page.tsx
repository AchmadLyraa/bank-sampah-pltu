import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import LoginForm from "@/components/login-form";
import Image from "next/image";

export default async function HomePage() {
  const session = await getServerSession(authOptions);
  if (session?.user) {
    switch (session.user.userType) {
      case "bank-sampah":
        redirect("/bank-sampah");
        break;
      case "controller":
        redirect("/controller");
        break;
      case "nasabah":
        redirect("/nasabah");
        break;
      default:
        break;
    }
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Image
            src="/logo.png"
            alt="Sistem Manajemen Bank Sampah"
            width={250}
            height={100}
            className="object-contain mx-auto"
            priority
          />
          <h1 className="text-2xl font-bold text-gray-900 mt-2">
            Aplikasi Bank Sampah
          </h1>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
