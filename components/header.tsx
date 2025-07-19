import { Button } from "@/components/ui/button"
import { logoutAction } from "@/app/actions/auth"
import { LogOut, Recycle } from "lucide-react"

interface HeaderProps {
  userType: "bank-sampah" | "nasabah"
}

export default function Header({ userType }: HeaderProps) {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Recycle className="h-8 w-8 text-green-600" />
          <span className="text-xl font-bold text-gray-900">Bank Sampah</span>
        </div>

        <form action={logoutAction}>
          <Button variant="outline" size="sm">
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </form>
      </div>
    </header>
  )
}
