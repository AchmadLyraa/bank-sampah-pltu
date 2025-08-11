"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginAction } from "@/app/actions/auth";
import { Loader2, Mail, Lock, LogIn } from "lucide-react";

export default function LoginForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError("");

    try {
      const result = await loginAction(formData);
      if (result?.error) {
        setError(result.error);
      }
    } catch (err) {
      setError("Terjadi kesalahan saat login");
    } finally {
      setLoading(false);
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
        <form action={handleSubmit} className="space-y-4">
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
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Masukkan password"
              required
              className="pl-4"
            />
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? "Memproses..." : "Masuk"}
          </Button>
        </form>

        {/* Demo Accounts Info */}
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
              <p className="text-purple-700">🔒 password</p>
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
