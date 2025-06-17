"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Eye, Sparkles, ImageIcon, CheckCircle, Share2, Clock, Loader2, Gift } from "lucide-react"
import Link from "next/link"

interface Post {
  id: number
  title: string
  status: string
  created_at: string
  theme: {
    anlass: string
    hobby: string
    alter: string
    budget: string
    stil: string
    beruf?: string
    zusatzinfo?: string
  }
  blogger_url?: string
  pinterest_url?: string
  creator_name: string
}

const statusConfig = {
  neu: { label: "Neu", color: "bg-gray-500", icon: Clock },
  text_generiert: { label: "Text generiert", color: "bg-blue-500", icon: Sparkles },
  bild_generiert: { label: "Bild generiert", color: "bg-purple-500", icon: ImageIcon },
  review: { label: "In Review", color: "bg-yellow-500", icon: Eye },
  freigegeben: { label: "Freigegeben", color: "bg-green-500", icon: CheckCircle },
  gepostet_blogger: { label: "Auf Blogger", color: "bg-emerald-500", icon: Share2 },
  gepostet_komplett: { label: "Vollständig veröffentlicht", color: "bg-emerald-600", icon: Share2 },
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("all")

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    }
  }, [status, router])

  useEffect(() => {
    if (session) {
      fetchPosts()
    }
  }, [session])

  const fetchPosts = async () => {
    try {
      const response = await fetch("/api/posts")
      if (response.ok) {
        const data = await response.json()
        setPosts(data.posts)
      }
    } catch (error) {
      console.error("Error fetching posts:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const config = statusConfig[status as keyof typeof statusConfig]
    if (!config) return null
    const Icon = config.icon
    return (
      <Badge className={`${config.color} text-white`}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
    )
  }

  const filteredPosts = posts.filter((post) => {
    if (activeTab === "all") return true
    if (activeTab === "pending") return ["neu", "text_generiert", "bild_generiert"].includes(post.status)
    if (activeTab === "review") return post.status === "review"
    if (activeTab === "published") return ["freigegeben", "gepostet_blogger", "gepostet_komplett"].includes(post.status)
    return true
  })

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600">Willkommen zurück, {session.user?.name}</p>
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
              <div className="text-2xl font-bold">{posts.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">In Bearbeitung</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {posts.filter((p) => ["neu", "text_generiert", "bild_generiert"].includes(p.status)).length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Zur Freigabe</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {posts.filter((p) => p.status === "review").length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Veröffentlicht</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {posts.filter((p) => ["gepostet_blogger", "gepostet_komplett"].includes(p.status)).length}
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
                <TabsTrigger value="all">Alle ({posts.length})</TabsTrigger>
                <TabsTrigger value="pending">
                  In Bearbeitung (
                  {posts.filter((p) => ["neu", "text_generiert", "bild_generiert"].includes(p.status)).length})
                </TabsTrigger>
                <TabsTrigger value="review">Review ({posts.filter((p) => p.status === "review").length})</TabsTrigger>
                <TabsTrigger value="published">
                  Veröffentlicht (
                  {posts.filter((p) => ["gepostet_blogger", "gepostet_komplett"].includes(p.status)).length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab}>
                {filteredPosts.length === 0 ? (
                  <div className="text-center py-12">
                    <Gift className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Noch keine Posts vorhanden</h3>
                    <p className="text-gray-600 mb-4">Erstellen Sie Ihr erstes Geschenkideen-Thema</p>
                    <Link href="/dashboard/new">
                      <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Neues Thema erstellen
                      </Button>
                    </Link>
                  </div>
                ) : (
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
                                <span>Erstellt: {new Date(post.created_at).toLocaleDateString("de-DE")}</span>
                              </div>
                              {(post.blogger_url || post.pinterest_url) && (
                                <div className="flex items-center gap-4 text-sm">
                                  {post.blogger_url && (
                                    <a
                                      href={post.blogger_url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-blue-600 hover:underline"
                                    >
                                      Blog-Post ansehen
                                    </a>
                                  )}
                                  {post.pinterest_url && (
                                    <a
                                      href={post.pinterest_url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-pink-600 hover:underline"
                                    >
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
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
