import type { DefaultSession, DefaultUser } from "next-auth"
import type { DefaultJWT } from "next-auth/jwt"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      userType: string
      role: string
      personId?: string
      bankSampahRelations?: any[]
      activeBankSampahId?: string
    } & DefaultSession["user"]
  }

  interface User extends DefaultUser {
    userType: string
    role: string
    personId?: string
    bankSampahRelations?: any[]
    activeBankSampahId?: string
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    userId: string
    userType: string
    role: string
    personId?: string
    bankSampahRelations?: any[]
    activeBankSampahId?: string
  }
}
