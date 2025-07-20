"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Home, Scale, Package, CreditCard, History, Users, LogOut, BarChart3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { logoutAction } from "@/app/actions/auth"

interface ClientNavigationProps {
  userType: "bank-sampah" | "nasabah"
}

const bankSampahNavItems = [
  {
    href: "/bank-sampah",
    label: "Dashboard",
    icon: Home,
  },
  {
    href: "/bank-sampah/nasabah",
    label: "Nasabah",
    icon: Users,
  },
  {
    href: "/bank-sampah/penimbangan",
    label: "Penimbangan",
    icon: Scale,
  },
  {
    href: "/bank-sampah/inventaris",
    label: "Inventaris",
    icon: Package,
  },
  {
    href: "/bank-sampah/penarikan",
    label: "Penarikan",
    icon: CreditCard,
  },
  {
    href: "/bank-sampah/transaksi",
    label: "Transaksi",
    icon: History,
  },
  {
    href: "/bank-sampah/laporan",
    label: "Laporan",
    icon: BarChart3,
  },
]

const nasabahNavItems = [
  {
    href: "/nasabah",
    label: "Dashboard",
    icon: Home,
  },
]

export function ClientNavigation({ userType }: ClientNavigationProps) {
  return (
    <>
      {/* Sidebar for desktop */}
      <SidebarNavigation userType={userType} />
      {/* Bottom navigation for mobile */}
      <BottomNavigation userType={userType} />
    </>
  )
}

function BottomNavigation({ userType }: ClientNavigationProps) {
  const pathname = usePathname()
  const navItems = userType === "bank-sampah" ? bankSampahNavItems : nasabahNavItems

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden z-50">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center py-2 px-3 rounded-lg transition-colors min-w-0 flex-1",
                isActive ? "text-blue-600 bg-blue-50" : "text-gray-600 hover:text-gray-900 hover:bg-gray-50",
              )}
            >
              <Icon className="h-5 w-5 mb-1" />
              <span className="text-xs font-medium truncate">{item.label}</span>
            </Link>
          )
        })}

        {/* Logout button */}
        <form action={logoutAction} className="flex-1">
          <Button
            type="submit"
            variant="ghost"
            className="flex flex-col items-center justify-center py-2 px-3 w-full h-auto text-gray-600 hover:text-red-600 hover:bg-red-50"
          >
            <LogOut className="h-5 w-5 mb-1" />
            <span className="text-xs font-medium">Logout</span>
          </Button>
        </form>
      </div>
    </div>
  )
}

function SidebarNavigation({ userType }: ClientNavigationProps) {
  const pathname = usePathname()
  const navItems = userType === "bank-sampah" ? bankSampahNavItems : nasabahNavItems

  return (
    <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-50">
      <div className="flex flex-col flex-grow bg-white border-r border-gray-200">
        {/* Header */}
        <div className="flex items-center flex-shrink-0 px-4 py-6 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
              <Package className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Bank Sampah</h1>
              <p className="text-xs text-gray-500 capitalize">{userType.replace("-", " ")}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-blue-50 text-blue-700 border border-blue-200"
                    : "text-gray-700 hover:bg-gray-50 hover:text-gray-900",
                )}
              >
                <Icon className="mr-3 h-5 w-5" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Logout */}
        <div className="flex-shrink-0 px-4 py-4 border-t border-gray-200">
          <form action={logoutAction}>
            <Button
              type="submit"
              variant="ghost"
              className="w-full justify-start text-gray-700 hover:text-red-600 hover:bg-red-50"
            >
              <LogOut className="mr-3 h-5 w-5" />
              Logout
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
