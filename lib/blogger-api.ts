// Google Blogger API Integration
interface BloggerPost {
  title: string
  content: string
  labels?: string[]
}

export class BloggerAPI {
  private accessToken: string
  private blogId: string

  constructor(accessToken: string) {
    this.accessToken = accessToken
    this.blogId = process.env.BLOGGER_BLOG_ID!
  }

  // Post zu Blogger veröffentlichen
  async publishPost(post: BloggerPost): Promise<{ url: string; id: string }> {
    const response = await fetch(`https://www.googleapis.com/blogger/v3/blogs/${this.blogId}/posts`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: post.title,
        content: post.content,
        labels: post.labels || [],
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Blogger API Error: ${error}`)
    }

    const data = await response.json()
    return {
      url: data.url,
      id: data.id,
    }
  }

  // Blog-Informationen abrufen
  async getBlogInfo() {
    const response = await fetch(`https://www.googleapis.com/blogger/v3/blogs/${this.blogId}`, {
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
      },
    })

    if (!response.ok) {
      throw new Error("Failed to fetch blog info")
    }

    return await response.json()
  }
}
