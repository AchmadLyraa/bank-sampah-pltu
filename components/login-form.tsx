"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { signIn, useSession, getSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Loader2,
  Mail,
  Lock,
  LogIn,
  Eye,
  EyeOff,
  CheckCircle,
} from "lucide-react";

export default function LoginForm() {
  const [loading, setLoading] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const callbackUrl = urlParams.get("callbackUrl");
    if (callbackUrl) {
      sessionStorage.setItem("intendedUrl", decodeURIComponent(callbackUrl));
      // Clean URL by removing callbackUrl parameter
      window.history.replaceState({}, "", "/");
    }
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Email atau password salah");
        setLoading(false);
      } else if (result?.ok) {
        setIsRedirecting(true);

        // INI KUNCINYA: Force refresh session dengan getSession() instead of update()
        // getSession() fetch fresh dari server, bukan dari context
        const freshSession = await getSession();

        const intendedUrl = sessionStorage.getItem("intendedUrl");
        if (intendedUrl) {
          sessionStorage.removeItem("intendedUrl");
          router.push(intendedUrl);
        } else {
          const role = freshSession?.user?.userType;
          if (role === "nasabah") {
            router.push("/nasabah");
          } else if (role === "bank-sampah") {
            router.push("/bank-sampah");
          } else if (role === "controller") {
            router.push("/controller");
          } else {
            router.push("/");
          }
        }
      }
    } catch (err) {
      setError("Terjadi kesalahan saat login");
      setLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-1 text-xl">
          <p className="text-gray-600">Silahkan Masuk</p>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="email@example.com"
              required
              className="pl-4"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              Password
            </Label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Masukkan password"
                required
                className="pl-4 pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" />
                )}
              </Button>
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          {isRedirecting && (
            <div className="p-3 rounded-lg bg-green-50 border border-green-200">
              <p className="text-green-800 text-sm flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Berhasil login, mengalihkan ke dashboard...
              </p>
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={loading || isRedirecting}
          >
            {loading && !isRedirecting && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {isRedirecting
              ? "Mengalihkan..."
              : loading
                ? "Memproses..."
                : "Masuk"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
