"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Save } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ApiClient } from "@/lib/api-client"
import { useToast } from "@/components/ui/use-toast"

export default function NewThemePage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    anlass: "",
    hobby: "",
    alter: "",
    beruf: "",
    stil: "",
    budget: "",
    zusatzinfo: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      console.log("Submitting theme:", formData)
      const result = await ApiClient.createTheme(formData)

      toast({
        title: "Thema erstellt",
        description: "Das neue Thema wurde erfolgreich erstellt.",
      })

      // Zur Detailseite des neuen Posts navigieren
      router.push(`/dashboard/posts/${result.post.id}`)
    } catch (error) {
      console.error("Error creating theme:", error)
      toast({
        title: "Fehler",
        description: "Das Thema konnte nicht erstellt werden. Bitte versuchen Sie es erneut.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Zurück
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Neues Geschenkideen-Thema</h1>
              <p className="text-gray-600">Erstellen Sie ein neues Thema für die Content-Generierung</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Thema-Details</CardTitle>
              <CardDescription>
                Geben Sie die Details für Ihr Geschenkideen-Thema ein. Diese Informationen werden für die KI-gestützte
                Content-Generierung verwendet.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Titel des Themas</Label>
                  <Input
                    id="title"
                    placeholder="z.B. Geschenke für Kaffeeliebhaber"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="anlass">Anlass</Label>
                    <Select value={formData.anlass} onValueChange={(value) => handleInputChange("anlass", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Anlass wählen" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="geburtstag">Geburtstag</SelectItem>
                        <SelectItem value="weihnachten">Weihnachten</SelectItem>
                        <SelectItem value="muttertag">Muttertag</SelectItem>
                        <SelectItem value="vatertag">Vatertag</SelectItem>
                        <SelectItem value="valentinstag">Valentinstag</SelectItem>
                        <SelectItem value="hochzeit">Hochzeit</SelectItem>
                        <SelectItem value="einzug">Einzug</SelectItem>
                        <SelectItem value="abschluss">Abschluss</SelectItem>
                        <SelectItem value="sonstiges">Sonstiges</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="hobby">Hobby/Interesse</Label>
                    <Select value={formData.hobby} onValueChange={(value) => handleInputChange("hobby", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Hobby wählen" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="kaffee">Kaffee</SelectItem>
                        <SelectItem value="technik">Technik</SelectItem>
                        <SelectItem value="garten">Garten</SelectItem>
                        <SelectItem value="fitness">Fitness</SelectItem>
                        <SelectItem value="kochen">Kochen</SelectItem>
                        <SelectItem value="lesen">Lesen</SelectItem>
                        <SelectItem value="musik">Musik</SelectItem>
                        <SelectItem value="reisen">Reisen</SelectItem>
                        <SelectItem value="kunst">Kunst</SelectItem>
                        <SelectItem value="sport">Sport</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="alter">Altersgruppe</Label>
                    <Select value={formData.alter} onValueChange={(value) => handleInputChange("alter", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Alter wählen" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="kinder">Kinder (0-12)</SelectItem>
                        <SelectItem value="teenager">Teenager (13-17)</SelectItem>
                        <SelectItem value="junge-erwachsene">Junge Erwachsene (18-30)</SelectItem>
                        <SelectItem value="erwachsene">Erwachsene (31-50)</SelectItem>
                        <SelectItem value="senioren">Senioren (50+)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="budget">Budget</Label>
                    <Select value={formData.budget} onValueChange={(value) => handleInputChange("budget", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Budget wählen" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unter-25">Unter 25€</SelectItem>
                        <SelectItem value="25-50">25-50€</SelectItem>
                        <SelectItem value="50-100">50-100€</SelectItem>
                        <SelectItem value="100-200">100-200€</SelectItem>
                        <SelectItem value="200-500">200-500€</SelectItem>
                        <SelectItem value="ueber-500">Über 500€</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="beruf">Beruf/Branche (optional)</Label>
                    <Input
                      id="beruf"
                      placeholder="z.B. Lehrer, Arzt, Student"
                      value={formData.beruf}
                      onChange={(e) => handleInputChange("beruf", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="stil">Stil/Persönlichkeit</Label>
                    <Select value={formData.stil} onValueChange={(value) => handleInputChange("stil", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Stil wählen" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="praktisch">Praktisch</SelectItem>
                        <SelectItem value="luxurioes">Luxuriös</SelectItem>
                        <SelectItem value="kreativ">Kreativ</SelectItem>
                        <SelectItem value="minimalistisch">Minimalistisch</SelectItem>
                        <SelectItem value="nostalgisch">Nostalgisch</SelectItem>
                        <SelectItem value="modern">Modern</SelectItem>
                        <SelectItem value="nachhaltig">Nachhaltig</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="zusatzinfo">Zusätzliche Informationen (optional)</Label>
                  <Textarea
                    id="zusatzinfo"
                    placeholder="Weitere Details, spezielle Wünsche oder Kontext..."
                    value={formData.zusatzinfo}
                    onChange={(e) => handleInputChange("zusatzinfo", e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <Button type="submit" className="flex-1" disabled={isSubmitting}>
                    <Save className="w-4 h-4 mr-2" />
                    {isSubmitting ? "Wird erstellt..." : "Thema erstellen"}
                  </Button>
                  <Link href="/dashboard">
                    <Button type="button" variant="outline">
                      Abbrechen
                    </Button>
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
