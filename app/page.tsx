import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Gift, Sparkles, Eye, Share2, BarChart3, Users } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Gift className="h-8 w-8 text-purple-600" />
            <h1 className="text-2xl font-bold text-gray-900">Presently</h1>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="outline">Dashboard</Button>
            </Link>
            <Link href="/auth/signin">
              <Button>Sign In</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            Automatisierte Geschenkideen-
            <span className="text-purple-600">Workflows</span>
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            KI-gestützte Content-Erstellung für Blogger und Pinterest. Von der Idee bis zur Veröffentlichung -
            vollautomatisch mit Freigabeprozess.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/dashboard">
              <Button size="lg" className="bg-purple-600 hover:bg-purple-700">
                <Sparkles className="mr-2 h-5 w-5" />
                Jetzt starten
              </Button>
            </Link>
            <Button size="lg" variant="outline">
              Demo ansehen
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-16">
        <h3 className="text-3xl font-bold text-center mb-12">Workflow-Features</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card>
            <CardHeader>
              <Sparkles className="h-10 w-10 text-purple-600 mb-2" />
              <CardTitle>KI-Content-Generierung</CardTitle>
              <CardDescription>Automatische Text- und Bildgenerierung mit Google Gemini und Vertex AI</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• SEO-optimierte Blogtexte</li>
                <li>• Pinterest-Beschreibungen</li>
                <li>• Automatische Hashtag-Generierung</li>
                <li>• Hochwertige Produktbilder</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Eye className="h-10 w-10 text-blue-600 mb-2" />
              <CardTitle>Review & Freigabe</CardTitle>
              <CardDescription>Strukturierter Freigabeprozess mit Audit-Trail</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Multi-User Review-System</li>
                <li>• Vollständige Versionierung</li>
                <li>• Kommentar-Funktionen</li>
                <li>• Status-Tracking</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Share2 className="h-10 w-10 text-green-600 mb-2" />
              <CardTitle>Auto-Publishing</CardTitle>
              <CardDescription>Direktes Posting zu Blogger und Pinterest nach Freigabe</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Google Blogger Integration</li>
                <li>• Pinterest API-Anbindung</li>
                <li>• Affiliate-Link Management</li>
                <li>• Scheduling-Funktionen</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <BarChart3 className="h-10 w-10 text-orange-600 mb-2" />
              <CardTitle>Analytics & Tracking</CardTitle>
              <CardDescription>Vollständige Übersicht über Performance und Status</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Workflow-Dashboard</li>
                <li>• Performance-Metriken</li>
                <li>• Erfolgs-Tracking</li>
                <li>• Export-Funktionen</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Users className="h-10 w-10 text-pink-600 mb-2" />
              <CardTitle>Team-Management</CardTitle>
              <CardDescription>Rollen-basierte Zugriffskontrolle für Teams</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Editor/Reviewer/Admin Rollen</li>
                <li>• OAuth2-Authentifizierung</li>
                <li>• Benutzer-Verwaltung</li>
                <li>• Audit-Logs</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Gift className="h-10 w-10 text-purple-600 mb-2" />
              <CardTitle>Geschenkideen-Engine</CardTitle>
              <CardDescription>Intelligente Themen-Verwaltung und Kategorisierung</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Anlass-basierte Kategorien</li>
                <li>• Budget-Segmentierung</li>
                <li>• Zielgruppen-Targeting</li>
                <li>• Trend-Analyse</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-purple-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-3xl font-bold mb-4">Bereit für automatisierte Content-Workflows?</h3>
          <p className="text-xl mb-8 opacity-90">
            Starten Sie noch heute mit der intelligenten Geschenkideen-Plattform
          </p>
          <Link href="/dashboard">
            <Button size="lg" variant="secondary">
              Kostenlos testen
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Gift className="h-6 w-6" />
            <span className="text-lg font-semibold">Presently</span>
          </div>
          <p className="text-gray-400">© 2024 Presently. Automatisierte Geschenkideen-Workflows für Content Creator.</p>
        </div>
      </footer>
    </div>
  )
}
