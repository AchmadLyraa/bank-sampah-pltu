"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { loginAction } from "@/app/actions/auth"
import { Loader2 } from "lucide-react"

export default function LoginForm() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError("")

    try {
      const result = await loginAction(formData)
      if (result?.error) {
        setError(result.error)
      }
    } catch (err) {
      setError("Terjadi kesalahan saat login")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Login</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" placeholder="email@example.com" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" placeholder="Password" required />
          </div>

          <div className="space-y-2">
            <Label>Tipe User</Label>
            <RadioGroup name="userType" defaultValue="nasabah" className="flex gap-6">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="nasabah" id="nasabah" />
                <Label htmlFor="nasabah">Nasabah</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="bank-sampah" id="bank-sampah" />
                <Label htmlFor="bank-sampah">Bank Sampah</Label>
              </div>
            </RadioGroup>
          </div>

          {error && <div className="text-red-600 text-sm">{error}</div>}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Login
          </Button>
        </form>

        <div className="mt-6 text-sm text-gray-600">
          <p className="font-semibold">Demo Accounts:</p>
          <p>Bank Sampah: admin@banksampah.com</p>
          <p>Nasabah: budi@email.com</p>
          <p>Password: password123</p>
        </div>
      </CardContent>
    </Card>
  )
}
