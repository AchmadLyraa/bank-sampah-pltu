import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { authenticateUser } from "@/lib/auth";
import type { JWT } from "next-auth/jwt";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const result = await authenticateUser({
            email: credentials.email,
            password: credentials.password,
          });

          if (result.success && result.user) {
            return {
              id: result.user.userId,
              email: result.user.email,
              name: result.user.nama,
              userType: result.user.userType,
              role: result.user.role,
              // Additional data based on user type
              ...(result.user.userType === "nasabah" && {
                personId: result.user.personId,
                bankSampahRelations: result.user.bankSampahRelations,
                activeBankSampahId: result.user.activeBankSampahId,
              }),
            };
          }
          return null;
        } catch (error) {
          console.error("Authentication error:", error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
  },
  jwt: {
    maxAge: 24 * 60 * 60, // 24 hours
  },
  callbacks: {
    async jwt({
      token,
      user,
      trigger,
      session,
    }: {
      token: JWT;
      user?: any;
      trigger?: "signIn" | "signUp" | "update";
      session?: any;
    }) {
      // Initial sign in
      if (user) {
        token.userId = user.id;
        token.userType = user.userType;
        token.role = user.role;
        token.personId = user.personId;
        token.bankSampahRelations = user.bankSampahRelations;
        token.activeBankSampahId = user.activeBankSampahId;
      }

      // Handle session update
      if (trigger === "update" && session?.user) {
            token.name = session.user.name;
            token.activeBankSampahId = session.user.activeBankSampahId;
      }

      return token;
    },

    async session({ session, token }: { session: any; token: JWT }) {
      if (token) {
        session.user.id = token.userId as string;
        session.user.userType = token.userType as string;
        session.user.role = token.role as string;
        session.user.personId = token.personId as string;
        session.user.bankSampahRelations = token.bankSampahRelations as any[];
        session.user.activeBankSampahId = token.activeBankSampahId as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/",
    error: "/",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
