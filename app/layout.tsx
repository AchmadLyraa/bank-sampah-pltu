import type React from "react";
import type { Metadata } from "next";
import "@/styles/globals.css";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { SessionProvider } from "@/components/session-provider";

// const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Bank Sampah",
  description: "Sistem Manajemen Bank Sampah",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="id">
      <body>
        {" "}
        <SessionProvider session={session}>{children}</SessionProvider>
      </body>
    </html>
  );
}
