import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { BlobStorage } from "@/lib/storage"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const post = await BlobStorage.getPost(params.id)
    if (!post) {
      return NextResponse.json({ error: "Post nicht gefunden" }, { status: 404 })
    }

    return NextResponse.json({ post })
  } catch (error) {
    console.error("Error fetching post:", error)
    return NextResponse.json({ error: "Fehler beim Laden des Posts" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const post = await BlobStorage.getPost(params.id)
    if (!post) {
      return NextResponse.json({ error: "Post nicht gefunden" }, { status: 404 })
    }

    const updates = await request.json()
    const updatedPost = { ...post, ...updates }

    await BlobStorage.savePost(updatedPost)

    return NextResponse.json({ post: updatedPost })
  } catch (error) {
    console.error("Error updating post:", error)
    return NextResponse.json({ error: "Fehler beim Aktualisieren des Posts" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await BlobStorage.deletePost(params.id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting post:", error)
    return NextResponse.json({ error: "Fehler beim Löschen des Posts" }, { status: 500 })
  }
}
