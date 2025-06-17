import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { BlobStorage } from "@/lib/storage"
import { BloggerAPI } from "@/lib/blogger-api"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log("Starting Blogger publishing for post:", params.id)

    const session = await getServerSession(authOptions)
    if (!session?.user || !session.accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const post = await BlobStorage.getPost(params.id)
    if (!post) {
      return NextResponse.json({ error: "Post nicht gefunden" }, { status: 404 })
    }

    if (post.status !== "freigegeben" && post.status !== "gepostet_pinterest") {
      return NextResponse.json({ error: "Post muss erst freigegeben werden" }, { status: 400 })
    }

    if (!post.blogHtml) {
      return NextResponse.json({ error: "Post hat keinen Blog-Inhalt" }, { status: 400 })
    }

    console.log("Publishing to Blogger")

    // Blogger API aufrufen
    const bloggerApi = new BloggerAPI(session.accessToken as string)
    const bloggerResponse = await bloggerApi.publishPost({
      title: post.title,
      content: post.blogHtml,
      labels: post.pinTags || [],
    })

    console.log("Published to Blogger:", bloggerResponse)

    // Post aktualisieren
    const updatedPost = {
      ...post,
      bloggerUrl: bloggerResponse.url,
      bloggerPostId: bloggerResponse.id,
      status: post.status === "gepostet_pinterest" ? "gepostet_komplett" : "gepostet_blogger",
      logs: [
        ...post.logs,
        {
          action: "published_blogger",
          user: session.user.email || "unknown",
          timestamp: new Date().toISOString(),
          details: { bloggerUrl: bloggerResponse.url },
        },
      ],
    }

    // Aktualisierter Post speichern
    await BlobStorage.savePost(updatedPost)

    return NextResponse.json({
      success: true,
      blogger: {
        bloggerUrl: bloggerResponse.url,
        publishedAt: new Date().toISOString(),
        blogId: process.env.BLOGGER_BLOG_ID,
        postId: bloggerResponse.id,
      },
      message: "Post erfolgreich auf Blogger veröffentlicht",
    })
  } catch (error) {
    console.error("Error publishing to Blogger:", error)
    return NextResponse.json({ error: "Fehler beim Veröffentlichen auf Blogger" }, { status: 500 })
  }
}
