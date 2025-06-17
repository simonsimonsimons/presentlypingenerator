"use client"

import { signIn, getSession } from "next-auth/react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Gift, Chrome } from "lucide-react"

export default function SignInPage() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Check if user is already signed in
    getSession().then((session) => {
      if (session) {
        router.push("/dashboard")
      }
    })
  }, [router])

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    try {
      const result = await signIn("google", {
        callbackUrl: "/dashboard",
        redirect: false,
      })

      if (result?.url) {
        router.push(result.url)
      }
    } catch (error) {
      console.error("Sign in error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Gift className="h-12 w-12 text-purple-600" />
          </div>
          <CardTitle className="text-2xl">Willkommen bei Presently</CardTitle>
          <CardDescription>
            Melden Sie sich an, um mit der automatisierten Geschenkideen-Erstellung zu beginnen
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={handleGoogleSignIn} disabled={isLoading} className="w-full" size="lg">
            <Chrome className="mr-2 h-5 w-5" />
            {isLoading ? "Wird angemeldet..." : "Mit Google anmelden"}
          </Button>

          <div className="text-center text-sm text-gray-600">
            <p>
              Durch die Anmeldung stimmen Sie unseren{" "}
              <a href="/terms" className="text-purple-600 hover:underline">
                Nutzungsbedingungen
              </a>{" "}
              und der{" "}
              <a href="/privacy" className="text-purple-600 hover:underline">
                Datenschutzerklärung
              </a>{" "}
              zu.
            </p>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">Benötigte Berechtigungen:</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Google Blogger - Für automatisches Veröffentlichen</li>
              <li>• Pinterest - Für Pin-Erstellung</li>
              <li>• Profil-Informationen - Für Ihr Benutzerkonto</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
