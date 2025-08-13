"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { resetUserPassword } from "@/app/actions/controller";
import {
  Search,
  Copy,
  CheckCircle,
  AlertCircle,
  AlertTriangle,
} from "lucide-react";

export function ResetPasswordForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [emailToReset, setEmailToReset] = useState("");
  const [confirmEmail, setConfirmEmail] = useState("");

  async function handleSubmit(formData: FormData) {
    const email = formData.get("email") as string;
    setEmailToReset(email);
    setShowConfirmDialog(true);
  }

  async function handleConfirmedReset() {
    if (confirmEmail !== emailToReset) {
      return; // Email doesn't match, don't proceed
    }

    setIsLoading(true);
    setResult(null);
    setShowConfirmDialog(false);

    try {
      const formData = new FormData();
      formData.append("email", emailToReset);
      const response = await resetUserPassword(formData);
      setResult(response);
    } catch (error) {
      setResult({ success: false, error: "Terjadi kesalahan sistem" });
    } finally {
      setIsLoading(false);
      setConfirmEmail("");
      setEmailToReset("");
    }
  }

  const copyPassword = async () => {
    if (result?.newPassword) {
      await navigator.clipboard.writeText(result.newPassword);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="w-full">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Cari User untuk Reset Password
          </CardTitle>
          <CardDescription>
            Masukkan email nasabah atau bank sampah yang ingin direset
            passwordnya
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form action={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Masukkan email user"
                required
                disabled={isLoading}
              />
            </div>

            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? "Mereset Password..." : "Reset Password"}
            </Button>
          </form>

          {result && (
            <Alert
              className={
                result.success
                  ? "border-green-200 bg-green-50"
                  : "border-red-200 bg-red-50"
              }
            >
              <div className="flex items-start gap-2">
                {result.success ? (
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                )}
                <div className="flex-1">
                  <AlertDescription
                    className={
                      result.success ? "text-green-800" : "text-red-800"
                    }
                  >
                    {result.success ? result.message : result.error}
                  </AlertDescription>

                  {result.success && result.newPassword && (
                    <div className="mt-4 space-y-3">
                      <div className="p-3 bg-white rounded-lg border">
                        <div className="text-sm text-gray-600 mb-1">
                          Informasi User:
                        </div>
                        <div className="font-medium">{result.userName}</div>
                        <div className="text-sm text-gray-500">
                          {result.userType}
                        </div>
                      </div>

                      <div className="p-3 bg-white rounded-lg border">
                        <div className="text-sm text-gray-600 mb-2">
                          Password Baru:
                        </div>
                        <div className="flex items-center gap-2">
                          <code className="flex-1 px-3 py-2 bg-gray-100 rounded font-mono text-lg">
                            {result.newPassword}
                          </code>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={copyPassword}
                            className="flex items-center gap-1 bg-transparent"
                          >
                            <Copy className="h-4 w-4" />
                            {copied ? "Copied!" : "Copy"}
                          </Button>
                        </div>
                        <div className="text-xs text-gray-500 mt-2">
                          Berikan password ini kepada user dan minta mereka
                          untuk menggantinya setelah login
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Konfirmasi Reset Password
            </DialogTitle>
            <DialogDescription>
              Anda akan mereset password untuk email:{" "}
              <strong>{emailToReset}</strong>
              <br />
              Tindakan ini tidak dapat dibatalkan. Ketik ulang email untuk
              konfirmasi.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="confirmEmail">
                Ketik ulang email untuk konfirmasi
              </Label>
              <Input
                id="confirmEmail"
                type="email"
                placeholder="Ketik ulang email"
                value={confirmEmail}
                onChange={(e) => setConfirmEmail(e.target.value)}
                className={
                  confirmEmail && confirmEmail !== emailToReset
                    ? "border-red-300"
                    : ""
                }
              />
              {confirmEmail && confirmEmail !== emailToReset && (
                <p className="text-sm text-red-600">Email tidak cocok</p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowConfirmDialog(false);
                setConfirmEmail("");
                setEmailToReset("");
              }}
            >
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmedReset}
              disabled={confirmEmail !== emailToReset || isLoading}
            >
              {isLoading ? "Mereset..." : "Ya, Reset Password"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
