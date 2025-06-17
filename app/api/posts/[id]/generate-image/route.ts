import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { BlobStorage } from "@/lib/storage"
import { AIServices } from "@/lib/ai-services"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log("Starting image generation for post:", params.id)

    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const post = await BlobStorage.getPost(params.id)
    if (!post) {
      return NextResponse.json({ error: "Post nicht gefunden" }, { status: 404 })
    }

    console.log("Generating image with theme:", post.theme)

    // AI-Bildgenerierung aufrufen
    const imageData = await AIServices.generateImage(post.theme)

    console.log("Image generation successful:", imageData.imageUrl)

    // Post aktualisieren
    const updatedPost = {
      ...post,
      imageUrl: imageData.imageUrl,
      imageAltText: imageData.altText,
      status: "bild_generiert",
      logs: [
        ...post.logs,
        {
          action: "image_generated",
          user: session.user.email || "unknown",
          timestamp: new Date().toISOString(),
        },
      ],
    }

    // Aktualisierter Post speichern
    await BlobStorage.savePost(updatedPost)

    return NextResponse.json({
      success: true,
      image: imageData,
      message: "Bild erfolgreich generiert",
    })
  } catch (error) {
    console.error("Error generating image:", error)
    return NextResponse.json({ error: "Fehler bei der Bildgenerierung" }, { status: 500 })
  }
}
