"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Home,
  Scale,
  Package,
  CreditCard,
  History,
  Users,
  LogOut,
  MapPinned,
  CircleUserRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { logoutAction } from "@/app/actions/auth";
import Image from "next/image";
import LogoutButton from "./LogoutButton";

interface ClientNavigationProps {
  userType: "bank-sampah" | "nasabah" | "controller";
  userName: string;
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
    label: "Beli Sampah",
    icon: Scale,
    special: true,
  },
  {
    href: "/bank-sampah/penarikan",
    label: "Penarikan",
    icon: CreditCard,
  },
];

const nasabahNavItems = [
  {
    href: "/nasabah",
    label: "Dashboard",
    icon: Home,
  },
];

const controllerNavItems = [
  {
    href: "/controller",
    label: "Dashboard",
    icon: Home,
  },
  {
    href: "/controller/bank-sampah",
    label: "Bank Sampah",
    icon: Package,
  },
  {
    href: "/controller/bank-sampah-map",
    label: "Peta",
    icon: MapPinned,
  },
  {
    href: "/controller/reset-password",
    label: "Reset Password",
    icon: CreditCard,
  },
];

export function ClientNavigation({
  userType,
  userName,
}: ClientNavigationProps) {
  return (
    <>
      {/* Sidebar for desktop */}
      <SidebarNavigation userType={userType} userName={userName} />
      {/* Bottom navigation for mobile */}
      <BottomNavigation userType={userType} userName={userName} />
    </>
  );
}

function BottomNavigation({ userType, userName }: ClientNavigationProps) {
  const pathname = usePathname();
  const navItems =
    userType === "bank-sampah"
      ? bankSampahNavItems
      : userType === "controller"
        ? controllerNavItems
        : nasabahNavItems;
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden z-50">
      <div className="flex items-center justify-center py-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          if (item.special) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="relative -mt-12 flex grow-1 bg-blue-600 text-white text-center flex-col items-center justify-center py-3 px-4 rounded-lg min-w-0 flex-1"
              >
                <Icon className="h-5 w-5 mb-1" />
                <span className="text-xs font-medium truncate">
                  {item.label}
                </span>
              </Link>
            );
          }
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center py-2 px-3 rounded-lg transition-colors min-w-0 flex-1",
                isActive
                  ? "text-blue-600"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50",
              )}
            >
              <Icon className="h-5 w-5 mb-1" />
              <span className="text-xs font-medium truncate">{item.label}</span>
            </Link>
          );
        })}

        {/* Conditional last button: Logout for nasabah, Profile for bank-sampah */}
        {userType === "nasabah" ? (
          // <form action={logoutAction} className="flex-1">
          //   <Button
          //     type="submit"
          //     variant="ghost"
          //     className="flex flex-col items-center justify-center py-2 px-3 w-full h-auto text-gray-600 hover:text-red-600 hover:bg-red-50"
          //   >
          //     <LogOut className="h-5 w-5 mb-1 text-red-600" />
          //     <span className="text-xs font-medium text-red-600">Logout</span>
          //   </Button>
          // </form>
          <LogoutButton />
        ) : userType === "bank-sampah" ? (
          <Link
            href="/bank-sampah/profile"
            className={cn(
              "flex flex-col items-center justify-center py-2 px-3 rounded-lg transition-colors min-w-0 flex-1",
              pathname === "/bank-sampah/profile"
                ? "text-blue-600"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50",
            )}
          >
            <CircleUserRound className="h-5 w-5 mb-1" />
            <span className="text-xs font-medium truncate">Profil</span>
          </Link>
        ) : (
          <Link
            href="/controller/profile"
            className={cn(
              "flex flex-col items-center justify-center py-2 px-3 rounded-lg transition-colors min-w-0 flex-1",
              pathname === "/controller/profile"
                ? "text-blue-600"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50",
            )}
          >
            <CircleUserRound className="h-5 w-5 mb-1" />
            <span className="text-xs font-medium truncate">Profil</span>
          </Link>
        )}
      </div>
    </div>
  );
}

function SidebarNavigation({ userType, userName }: ClientNavigationProps) {
  const pathname = usePathname();
  const navItems =
    userType === "bank-sampah"
      ? bankSampahNavItems
      : userType === "controller"
        ? controllerNavItems
        : nasabahNavItems;

  return (
    <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-50">
      <div className="flex flex-col flex-grow bg-white border-r border-gray-200">
        {/* Header */}
        <div className="flex items-center flex-shrink-0 px-4 py-6 border-b border-gray-200">
          <div className="flex items-center gap-2">
            {/*<div className="w-8 h-8  rounded-lg flex items-center justify-center self-start">
              <Image
                src="/logo-1.png"
                alt="Logo Bank Sampah"
                width={40}
                height={40}
                className="object-contain"
              />
            </div>*/}
            <div>
              <Image
                src="/logo-2.png"
                alt="Logo Bank Sampah"
                width={180}
                height={180}
                className="object-contain mb-2"
              />
              <h1 className="text-md font-bold text-gray-900">
                Aplikasi Bank Sampah
              </h1>
              <p className="text-xs text-gray-500 capitalize">{userName}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

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
            );
          })}
        </nav>

        {/* Conditional last button: Logout for nasabah, Profile for bank-sampah */}
        <div className="flex-shrink-0 px-4 py-4 border-t border-gray-200">
          {userType === "nasabah" ? (
            // <form action={logoutAction}>
            //   <Button
            //     type="submit"
            //     variant="ghost"
            //     className="w-full justify-start text-gray-700 hover:text-red-600 hover:bg-red-50"
            //   >
            //     <LogOut className="mr-3 h-5 w-5" />
            //     Logout
            //   </Button>
            // </form>
            <LogoutButton />
          ) : userType === "bank-sampah" ? (
            <Link
              href="/bank-sampah/profile"
              className={cn(
                "flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                pathname === "/bank-sampah/profile"
                  ? "bg-blue-50 text-blue-700 border border-blue-200"
                  : "text-gray-700 hover:bg-gray-50 hover:text-gray-900",
              )}
            >
              <CircleUserRound className="mr-3 h-5 w-5" />
              Profil
            </Link>
          ) : (
            <Link
              href="/controller/profile"
              className={cn(
                "flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                pathname === "/controller/profile"
                  ? "bg-blue-50 text-blue-700 border border-blue-200"
                  : "text-gray-700 hover:bg-gray-50 hover:text-gray-900",
              )}
            >
              <CircleUserRound className="mr-3 h-5 w-5" />
              Profil
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
