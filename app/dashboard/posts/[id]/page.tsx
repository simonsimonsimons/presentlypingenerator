"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Sparkles, ImageIcon, Eye, CheckCircle, Share2, Clock } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"

// Mock post data - in production, fetch from API
const mockPost = {
  id: 1,
  title: "Geschenke für Kaffeeliebhaber",
  status: "bild_generiert",
  createdAt: "2024-01-15",
  createdBy: "user1",
  theme: {
    anlass: "Geburtstag",
    hobby: "Kaffee",
    alter: "erwachsene",
    budget: "50-100€",
    stil: "praktisch",
    beruf: "Büro",
    zusatzinfo: "Person trinkt täglich 3-4 Tassen Kaffee",
  },
  blogHtml: `
    <h1>Die perfekten Geschenke für Kaffeeliebhaber</h1>
    <p>Kaffee ist mehr als nur ein Getränk – es ist eine Leidenschaft, ein Ritual und für viele Menschen der perfekte Start in den Tag.</p>
    <h2>Premium Kaffeebohnen und Röstungen</h2>
    <p>Hochwertige Kaffeebohnen sind das Herzstück jeder guten Tasse Kaffee.</p>
  `,
  pinDescription:
    "Entdecke die besten Geschenkideen für Kaffeeliebhaber! Von Premium-Bohnen bis zu professionellen Zubereitungsgeräten.",
  pinTags: ["#Kaffee", "#Geschenke", "#Kaffeeliebhaber", "#Geburtstag"],
  imageUrl: "/placeholder.svg?height=400&width=600&text=Kaffee+Geschenke",
  logs: [
    { action: "created", user: "user1", timestamp: "2024-01-15T10:00:00Z" },
    { action: "text_generated", user: "user1", timestamp: "2024-01-15T10:30:00Z" },
    { action: "image_generated", user: "user1", timestamp: "2024-01-15T11:00:00Z" },
  ],
}

const statusConfig = {
  neu: { label: "Neu", color: "bg-gray-500", icon: Clock },
  text_generiert: { label: "Text generiert", color: "bg-blue-500", icon: Sparkles },
  bild_generiert: { label: "Bild generiert", color: "bg-purple-500", icon: ImageIcon },
  review: { label: "In Review", color: "bg-yellow-500", icon: Eye },
  freigegeben: { label: "Freigegeben", color: "bg-green-500", icon: CheckCircle },
  gepostet: { label: "Veröffentlicht", color: "bg-emerald-600", icon: Share2 },
}

export default function PostDetailPage() {
  const params = useParams()
  const [post, setPost] = useState(mockPost)
  const [isGenerating, setIsGenerating] = useState(false)
  const [reviewComment, setReviewComment] = useState("")

  const getStatusBadge = (status: string) => {
    const config = statusConfig[status as keyof typeof statusConfig]
    const Icon = config.icon
    return (
      <Badge className={`${config.color} text-white`}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
    )
  }

  const handleGenerateText = async () => {
    setIsGenerating(true)
    try {
      const response = await fetch(`/api/posts/${params.id}/generate-text`, {
        method: "POST",
      })
      const data = await response.json()
      if (data.success) {
        setPost((prev) => ({
          ...prev,
          status: "text_generiert",
          blogHtml: data.content.blogHtml,
          pinDescription: data.content.pinDescription,
          pinTags: data.content.pinTags,
        }))
      }
    } catch (error) {
      console.error("Error generating text:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleGenerateImage = async () => {
    setIsGenerating(true)
    try {
      const response = await fetch(`/api/posts/${params.id}/generate-image`, {
        method: "POST",
      })
      const data = await response.json()
      if (data.success) {
        setPost((prev) => ({
          ...prev,
          status: "bild_generiert",
          imageUrl: data.image.imageUrl,
        }))
      }
    } catch (error) {
      console.error("Error generating image:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleApprove = async () => {
    try {
      const response = await fetch(`/api/posts/${params.id}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comment: reviewComment }),
      })
      const data = await response.json()
      if (data.success) {
        setPost((prev) => ({ ...prev, status: "freigegeben" }))
      }
    } catch (error) {
      console.error("Error approving post:", error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Zurück
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{post.title}</h1>
                <div className="flex items-center gap-4 mt-1">
                  {getStatusBadge(post.status)}
                  <span className="text-sm text-gray-600">Erstellt am {post.createdAt}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {post.status === "neu" && (
                <Button onClick={handleGenerateText} disabled={isGenerating}>
                  <Sparkles className="w-4 h-4 mr-2" />
                  {isGenerating ? "Generiere..." : "Text generieren"}
                </Button>
              )}
              {post.status === "text_generiert" && (
                <Button onClick={handleGenerateImage} disabled={isGenerating}>
                  <ImageIcon className="w-4 h-4 mr-2" />
                  {isGenerating ? "Generiere..." : "Bild generieren"}
                </Button>
              )}
              {post.status === "bild_generiert" && (
                <Button onClick={handleApprove}>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Freigeben
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Tabs defaultValue="content" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="content">Content</TabsTrigger>
                <TabsTrigger value="pinterest">Pinterest</TabsTrigger>
                <TabsTrigger value="preview">Vorschau</TabsTrigger>
              </TabsList>

              <TabsContent value="content" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Blog-Content</CardTitle>
                    <CardDescription>KI-generierter Blog-Artikel mit SEO-Optimierung</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {post.blogHtml ? (
                      <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: post.blogHtml }} />
                    ) : (
                      <p className="text-gray-500 italic">Noch kein Content generiert</p>
                    )}
                  </CardContent>
                </Card>

                {post.imageUrl && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Generiertes Bild</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <img
                        src={post.imageUrl || "/placeholder.svg"}
                        alt="Generiertes Bild für den Post"
                        className="w-full rounded-lg"
                      />
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="pinterest" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Pinterest Pin-Beschreibung</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {post.pinDescription ? (
                      <p className="text-gray-700">{post.pinDescription}</p>
                    ) : (
                      <p className="text-gray-500 italic">Noch keine Beschreibung generiert</p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Pinterest Hashtags</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {post.pinTags && post.pinTags.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {post.pinTags.map((tag, index) => (
                          <Badge key={index} variant="secondary">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 italic">Noch keine Hashtags generiert</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="preview">
                <Card>
                  <CardHeader>
                    <CardTitle>Vollständige Vorschau</CardTitle>
                    <CardDescription>So wird der Content veröffentlicht</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {post.imageUrl && (
                      <img src={post.imageUrl || "/placeholder.svg"} alt="Header Bild" className="w-full rounded-lg" />
                    )}
                    {post.blogHtml && (
                      <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: post.blogHtml }} />
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Theme Details */}
            <Card>
              <CardHeader>
                <CardTitle>Thema-Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <span className="font-medium">Anlass:</span> {post.theme.anlass}
                </div>
                <div>
                  <span className="font-medium">Hobby:</span> {post.theme.hobby}
                </div>
                <div>
                  <span className="font-medium">Alter:</span> {post.theme.alter}
                </div>
                <div>
                  <span className="font-medium">Budget:</span> {post.theme.budget}
                </div>
                <div>
                  <span className="font-medium">Stil:</span> {post.theme.stil}
                </div>
                {post.theme.beruf && (
                  <div>
                    <span className="font-medium">Beruf:</span> {post.theme.beruf}
                  </div>
                )}
                {post.theme.zusatzinfo && (
                  <div>
                    <span className="font-medium">Zusatzinfo:</span>
                    <p className="text-sm text-gray-600 mt-1">{post.theme.zusatzinfo}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Review Section */}
            {post.status === "bild_generiert" && (
              <Card>
                <CardHeader>
                  <CardTitle>Review & Freigabe</CardTitle>
                  <CardDescription>Prüfen Sie den Content vor der Veröffentlichung</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    placeholder="Kommentar zur Freigabe (optional)"
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <Button onClick={handleApprove} className="flex-1">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Freigeben
                    </Button>
                    <Button variant="outline" className="flex-1">
                      Ablehnen
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Publishing */}
            {post.status === "freigegeben" && (
              <Card>
                <CardHeader>
                  <CardTitle>Veröffentlichung</CardTitle>
                  <CardDescription>Content zu Blogger und Pinterest veröffentlichen</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full">
                    <Share2 className="w-4 h-4 mr-2" />
                    Zu Blogger veröffentlichen
                  </Button>
                  <Button className="w-full" variant="outline">
                    <Share2 className="w-4 h-4 mr-2" />
                    Pinterest Pin erstellen
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Activity Log */}
            <Card>
              <CardHeader>
                <CardTitle>Aktivitäts-Log</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {post.logs.map((log, index) => (
                    <div key={index} className="flex items-center gap-3 text-sm">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div className="flex-1">
                        <div className="font-medium">{log.action}</div>
                        <div className="text-gray-500">
                          {log.user} • {new Date(log.timestamp).toLocaleString("de-DE")}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
