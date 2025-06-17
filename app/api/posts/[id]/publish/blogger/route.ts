import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    // Get post and user tokens
    const posts = await sql`
      SELECT gp.*, i.encrypted_credentials 
      FROM gift_posts gp
      JOIN integrations i ON i.user_id = gp.created_by AND i.service = 'google'
      WHERE gp.id = ${id} AND gp.status = 'freigegeben'
    `

    if (posts.length === 0) {
      return NextResponse.json({ error: "Post nicht gefunden oder nicht freigegeben" }, { status: 404 })
    }

    const post = posts[0]
    const credentials = JSON.parse(post.encrypted_credentials)

    // Get blog ID from environment or database
    const blogId = process.env.BLOGGER_BLOG_ID

    // Prepare blog post content
    const blogContent = `
      ${post.blog_html}
      
      <div style="margin-top: 30px; padding: 20px; background: #f5f5f5; border-radius: 8px;">
        <h3>🎁 Weitere Geschenkideen entdecken</h3>
        <p>Besuchen Sie unseren Blog für mehr inspirierende Geschenkideen!</p>
      </div>
    `

    // Publish to Blogger
    const bloggerResponse = await fetch(`https://www.googleapis.com/blogger/v3/blogs/${blogId}/posts`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${credentials.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: post.title,
        content: blogContent,
        labels: [post.hobby, post.anlass, "Geschenke"],
      }),
    })

    if (!bloggerResponse.ok) {
      const error = await bloggerResponse.text()
      throw new Error(`Blogger API error: ${error}`)
    }

    const bloggerData = await bloggerResponse.json()

    // Update post in database
    await sql`
      UPDATE gift_posts 
      SET 
        status = 'gepostet_blogger',
        blogger_url = ${bloggerData.url},
        blogger_post_id = ${bloggerData.id},
        published_blogger_at = NOW(),
        updated_at = NOW()
      WHERE id = ${id}
    `

    // Log activity
    await sql`
      INSERT INTO activity_logs (post_id, user_id, action, details)
      VALUES (${id}, ${session.user.id}, 'published_blogger', ${JSON.stringify({
        blogger_url: bloggerData.url,
        blogger_post_id: bloggerData.id,
      })})
    `

    return NextResponse.json({
      success: true,
      blogger: {
        url: bloggerData.url,
        postId: bloggerData.id,
        publishedAt: new Date().toISOString(),
      },
      message: "Post erfolgreich auf Blogger veröffentlicht",
    })
  } catch (error) {
    console.error("Error publishing to Blogger:", error)
    return NextResponse.json({ error: "Fehler beim Veröffentlichen auf Blogger" }, { status: 500 })
  }
}
