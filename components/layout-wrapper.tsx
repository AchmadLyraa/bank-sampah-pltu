import type React from "react"
import { BottomNavigation, SidebarNavigation } from "./navigation"

interface LayoutWrapperProps {
  children: React.ReactNode
  userType: "bank-sampah" | "nasabah"
}

export default function LayoutWrapper({ children, userType }: LayoutWrapperProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar for desktop */}
      <SidebarNavigation userType={userType} />

      {/* Main content */}
      <div className="md:pl-64">
        <main className="pb-20 md:pb-0">{children}</main>
      </div>

      {/* Bottom navigation for mobile */}
      <BottomNavigation userType={userType} />
    </div>
  )
}
