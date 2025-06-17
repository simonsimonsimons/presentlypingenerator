import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/toaster"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Presently - Automatisierte Geschenkideen-Workflows",
  description:
    "KI-gestützte Content-Erstellung für Blogger und Pinterest. Von der Idee bis zur Veröffentlichung - vollautomatisch mit Freigabeprozess.",
  generator: "v0.dev",
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Prüfen, ob der Benutzer eingeloggt ist
  const session = await getServerSession(authOptions)

  // Wenn der Pfad nicht die Startseite oder Auth-Seiten ist und der Benutzer nicht eingeloggt ist,
  // zur Login-Seite umleiten
  const isAuthPage =
    typeof window !== "undefined" && (window.location.pathname === "/" || window.location.pathname.startsWith("/auth"))

  if (!session && !isAuthPage) {
    redirect("/auth/signin")
  }

  return (
    <html lang="de">
      <body className={inter.className}>
        {children}
        <Toaster />
      </body>
    </html>
  )
}
