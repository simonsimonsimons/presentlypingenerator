"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Eye, Sparkles, ImageIcon, CheckCircle, Share2, Clock } from "lucide-react"
import Link from "next/link"

// Mock data for demonstration
const mockPosts = [
  {
    id: 1,
    title: "Geschenke für Kaffeeliebhaber",
    status: "freigegeben",
    createdAt: "2024-01-15",
    theme: { anlass: "Geburtstag", hobby: "Kaffee", budget: "50-100€" },
    blogUrl: "https://blog.example.com/kaffee-geschenke",
    pinterestUrl: "https://pinterest.com/pin/123456",
  },
  {
    id: 2,
    title: "Weihnachtsgeschenke für Technik-Fans",
    status: "bild_generiert",
    createdAt: "2024-01-14",
    theme: { anlass: "Weihnachten", hobby: "Technik", budget: "100-200€" },
  },
  {
    id: 3,
    title: "Muttertag Geschenke für Gärtnerinnen",
    status: "text_generiert",
    createdAt: "2024-01-13",
    theme: { anlass: "Muttertag", hobby: "Garten", budget: "25-50€" },
  },
  {
    id: 4,
    title: "Geschenke für Fitness-Enthusiasten",
    status: "neu",
    createdAt: "2024-01-12",
    theme: { anlass: "Geburtstag", hobby: "Fitness", budget: "75-150€" },
  },
]

const statusConfig = {
  neu: { label: "Neu", color: "bg-gray-500", icon: Clock },
  text_generiert: { label: "Text generiert", color: "bg-blue-500", icon: Sparkles },
  bild_generiert: { label: "Bild generiert", color: "bg-purple-500", icon: ImageIcon },
  review: { label: "In Review", color: "bg-yellow-500", icon: Eye },
  freigegeben: { label: "Freigegeben", color: "bg-green-500", icon: CheckCircle },
  gepostet: { label: "Veröffentlicht", color: "bg-emerald-600", icon: Share2 },
}

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("all")

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

  const filteredPosts = mockPosts.filter((post) => {
    if (activeTab === "all") return true
    if (activeTab === "pending") return ["neu", "text_generiert", "bild_generiert"].includes(post.status)
    if (activeTab === "review") return post.status === "review"
    if (activeTab === "published") return ["freigegeben", "gepostet"].includes(post.status)
    return true
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600">Verwalten Sie Ihre Geschenkideen-Workflows</p>
            </div>
            <Link href="/dashboard/new">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Neues Thema
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Gesamt Posts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockPosts.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">In Bearbeitung</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {mockPosts.filter((p) => ["neu", "text_generiert", "bild_generiert"].includes(p.status)).length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Zur Freigabe</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {mockPosts.filter((p) => p.status === "review").length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Veröffentlicht</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {mockPosts.filter((p) => ["freigegeben", "gepostet"].includes(p.status)).length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Posts List */}
        <Card>
          <CardHeader>
            <CardTitle>Geschenkideen-Posts</CardTitle>
            <CardDescription>Übersicht aller Ihrer Content-Workflows</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-6">
                <TabsTrigger value="all">Alle</TabsTrigger>
                <TabsTrigger value="pending">In Bearbeitung</TabsTrigger>
                <TabsTrigger value="review">Review</TabsTrigger>
                <TabsTrigger value="published">Veröffentlicht</TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab}>
                <div className="space-y-4">
                  {filteredPosts.map((post) => (
                    <Card key={post.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold text-lg">{post.title}</h3>
                              {getStatusBadge(post.status)}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                              <span>Anlass: {post.theme.anlass}</span>
                              <span>Hobby: {post.theme.hobby}</span>
                              <span>Budget: {post.theme.budget}</span>
                              <span>Erstellt: {post.createdAt}</span>
                            </div>
                            {post.blogUrl && (
                              <div className="flex items-center gap-4 text-sm">
                                <a href={post.blogUrl} className="text-blue-600 hover:underline">
                                  Blog-Post ansehen
                                </a>
                                {post.pinterestUrl && (
                                  <a href={post.pinterestUrl} className="text-pink-600 hover:underline">
                                    Pinterest Pin
                                  </a>
                                )}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Link href={`/dashboard/posts/${post.id}`}>
                              <Button variant="outline" size="sm">
                                <Eye className="w-4 h-4 mr-1" />
                                Details
                              </Button>
                            </Link>
                            {post.status === "neu" && (
                              <Button size="sm">
                                <Sparkles className="w-4 h-4 mr-1" />
                                Text generieren
                              </Button>
                            )}
                            {post.status === "text_generiert" && (
                              <Button size="sm">
                                <ImageIcon className="w-4 h-4 mr-1" />
                                Bild generieren
                              </Button>
                            )}
                            {post.status === "bild_generiert" && (
                              <Button size="sm" variant="secondary">
                                <Eye className="w-4 h-4 mr-1" />
                                Zur Freigabe
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
