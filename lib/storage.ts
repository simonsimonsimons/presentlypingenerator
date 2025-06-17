// Vercel Blob Storage für alle Dateien
import { put, del, list } from "@vercel/blob"

interface PostData {
  id: string
  title: string
  status: string
  createdAt: string
  theme: {
    anlass: string
    hobby: string
    alter: string
    budget: string
    stil: string
    beruf?: string
    zusatzinfo?: string
  }
  blogHtml?: string
  pinDescription?: string
  pinTags?: string[]
  imageUrl?: string
  bloggerUrl?: string
  pinterestUrl?: string
  logs: Array<{
    action: string
    user: string
    timestamp: string
    details?: any
  }>
}

export class BlobStorage {
  // Posts in Blob Storage speichern
  static async savePost(post: PostData): Promise<void> {
    const blob = await put(`posts/${post.id}.json`, JSON.stringify(post), {
      access: "public",
      contentType: "application/json",
    })
    console.log("Post saved to blob:", blob.url)
  }

  // Post aus Blob Storage laden
  static async getPost(id: string): Promise<PostData | null> {
    try {
      const response = await fetch(`${process.env.BLOB_READ_WRITE_TOKEN}/posts/${id}.json`)
      if (!response.ok) return null
      return await response.json()
    } catch (error) {
      console.error("Error loading post:", error)
      return null
    }
  }

  // Alle Posts auflisten
  static async listPosts(): Promise<PostData[]> {
    try {
      const { blobs } = await list({ prefix: "posts/" })
      const posts: PostData[] = []

      for (const blob of blobs) {
        const response = await fetch(blob.url)
        if (response.ok) {
          const post = await response.json()
          posts.push(post)
        }
      }

      return posts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    } catch (error) {
      console.error("Error listing posts:", error)
      return []
    }
  }

  // Bild in Blob Storage speichern
  static async saveImage(imageBuffer: Buffer, filename: string): Promise<string> {
    const blob = await put(`images/${filename}`, imageBuffer, {
      access: "public",
      contentType: "image/png",
    })
    return blob.url
  }

  // Post löschen
  static async deletePost(id: string): Promise<void> {
    await del(`posts/${id}.json`)
  }
}
