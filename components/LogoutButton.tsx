"use client";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export default function LogoutButton() {
  return (
    <Button
      onClick={() =>
        signOut({
          redirect: true,
          callbackUrl: "/",
        })
      }
      variant="ghost"
      className="text-white hover:text-red-800 hover:bg-red-50 bg-red-500 border hover:border-red-800"
    >
      <LogOut className="h-5 w-5 mr-2" />
      Logout
    </Button>
  );
}
