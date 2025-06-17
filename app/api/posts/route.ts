import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { BlobStorage } from "@/lib/storage"
import { v4 as uuidv4 } from "uuid"

export async function GET(request: NextRequest) {
  try {
    console.log("Fetching posts")

    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")

    // Alle Posts aus Blob Storage laden
    let posts = await BlobStorage.listPosts()

    // Nach Status filtern, wenn angegeben
    if (status) {
      posts = posts.filter((post) => post.status === status)
    }

    console.log(`Found ${posts.length} posts`)

    return NextResponse.json({ posts })
  } catch (error) {
    console.error("Error fetching posts:", error)
    return NextResponse.json({ error: "Fehler beim Laden der Posts" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("Creating new post")

    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()

    // Neuen Post erstellen
    const newPost = {
      id: uuidv4(),
      title: body.title,
      status: "neu",
      createdAt: new Date().toISOString(),
      createdBy: session.user.email || "unknown",
      theme: {
        anlass: body.anlass,
        hobby: body.hobby,
        alter: body.alter,
        budget: body.budget,
        stil: body.stil,
        beruf: body.beruf,
        zusatzinfo: body.zusatzinfo,
      },
      logs: [
        {
          action: "created",
          user: session.user.email || "unknown",
          timestamp: new Date().toISOString(),
        },
      ],
    }

    // Post in Blob Storage speichern
    await BlobStorage.savePost(newPost)

    console.log("Created new post:", newPost.id)

    return NextResponse.json({ success: true, post: newPost }, { status: 201 })
  } catch (error) {
    console.error("Error creating post:", error)
    return NextResponse.json({ error: "Fehler beim Erstellen des Posts" }, { status: 500 })
  }
}
