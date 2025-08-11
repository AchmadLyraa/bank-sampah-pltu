import type React from "react";
import { ClientNavigation } from "./client-navigation";

interface LayoutWrapperProps {
  children: React.ReactNode;
  userType: "bank-sampah" | "nasabah" | "controller";
  userName: string;
}

export default function LayoutWrapper({
  children,
  userType,
  userName,
}: LayoutWrapperProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Client Navigation Component */}
      <ClientNavigation userType={userType} userName={userName} />

      {/* Main content */}
      <div className="md:pl-64">
        <main className="pb-20 md:pb-0">{children}</main>
      </div>
    </div>
  );
}
