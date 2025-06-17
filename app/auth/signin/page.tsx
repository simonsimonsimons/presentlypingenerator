"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Gift } from "lucide-react"
import { useRouter } from "next/navigation"

export default function SignIn() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    try {
      await signIn("google", { callbackUrl: "/dashboard" })
    } catch (error) {
      console.error("Sign in error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-pink-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Gift className="h-12 w-12 text-purple-600" />
          </div>
          <CardTitle className="text-2xl">Anmelden bei Presently</CardTitle>
          <CardDescription>
            Melden Sie sich mit Ihrem Google-Konto an, um auf die Geschenkideen-Plattform zuzugreifen
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Button className="w-full" onClick={handleGoogleSignIn} disabled={isLoading}>
              {isLoading ? "Wird angemeldet..." : "Mit Google anmelden"}
            </Button>
            <div className="text-center text-sm text-gray-500">
              <p>Durch die Anmeldung akzeptieren Sie unsere Nutzungsbedingungen und Datenschutzrichtlinien.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
