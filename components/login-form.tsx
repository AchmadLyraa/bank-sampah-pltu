"use client";

import type React from "react";
import { useState } from "react";
import { signIn } from "next-auth/react";
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
        setLoading(false); // Only set loading false on error
      } else if (result?.ok) {
        setIsRedirecting(true);
        router.refresh();
      }
    } catch (err) {
      setError("Terjadi kesalahan saat login");
      setLoading(false); // Only set loading false on error
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2 text-2xl">
          <LogIn className="h-6 w-6 text-green-600" />
          Login
        </CardTitle>
        <p className="text-gray-600">Masuk ke akun Anda</p>
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

        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="font-semibold text-blue-900 mb-2">🔑 Akun Demo:</p>
          <div className="space-y-2 text-sm">
            <div className="bg-white p-2 rounded border">
              <p className="font-medium text-blue-800">👨‍💼 Admin Bank Sampah:</p>
              <p className="text-blue-700">📧 admin@banksampah.com</p>
              <p className="text-blue-700">🔒 password123</p>
            </div>
            <div className="bg-white p-2 rounded border">
              <p className="font-medium text-green-800">👤 Nasabah:</p>
              <p className="text-green-700">📧 budi@email.com</p>
              <p className="text-green-700">🔒 password123</p>
            </div>
            <div className="bg-white p-2 rounded border">
              <p className="font-medium text-purple-800">⚙️ Controller:</p>
              <p className="text-purple-700">📧 admin@controller.com</p>
              <p className="text-purple-700">🔒 password123</p>
            </div>
          </div>
          <p className="text-xs text-blue-600 mt-2">
            💡 Sistem akan otomatis mendeteksi jenis akun Anda
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
