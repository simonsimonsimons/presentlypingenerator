import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { BlobStorage } from "@/lib/storage"
import { AIServices } from "@/lib/ai-services"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log("Starting text generation for post:", params.id)

    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const post = await BlobStorage.getPost(params.id)
    if (!post) {
      return NextResponse.json({ error: "Post nicht gefunden" }, { status: 404 })
    }

    console.log("Generating text with theme:", post.theme)

    // AI-Textgenerierung aufrufen
    const generatedContent = await AIServices.generateText({
      theme: post.theme,
    })

    console.log("Text generation successful")

    // Post aktualisieren
    const updatedPost = {
      ...post,
      blogHtml: generatedContent.blogHtml,
      pinDescription: generatedContent.pinDescription,
      pinTags: generatedContent.pinTags,
      status: "text_generiert",
      logs: [
        ...post.logs,
        {
          action: "text_generated",
          user: session.user.email || "unknown",
          timestamp: new Date().toISOString(),
        },
      ],
    }

    // Aktualisierter Post speichern
    await BlobStorage.savePost(updatedPost)

    return NextResponse.json({
      success: true,
      content: generatedContent,
      message: "Text erfolgreich generiert",
    })
  } catch (error) {
    console.error("Error generating text:", error)
    return NextResponse.json({ error: "Fehler bei der Textgenerierung" }, { status: 500 })
  }
}
