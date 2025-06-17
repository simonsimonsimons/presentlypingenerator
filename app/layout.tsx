import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Providers } from "./providers"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Presently - Automatisierte Geschenkideen-Workflows",
  description:
    "KI-gestützte Content-Erstellung für Blogger und Pinterest. Von der Idee bis zur Veröffentlichung - vollautomatisch mit Freigabeprozess.",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="de">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
