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

    // Get post with blogger URL
    const posts = await sql`
      SELECT gp.*, i.encrypted_credentials 
      FROM gift_posts gp
      JOIN integrations i ON i.user_id = gp.created_by AND i.service = 'google'
      WHERE gp.id = ${id} AND gp.blogger_url IS NOT NULL
    `

    if (posts.length === 0) {
      return NextResponse.json({ error: "Post muss zuerst auf Blogger veröffentlicht werden" }, { status: 404 })
    }

    const post = posts[0]
    const credentials = JSON.parse(post.encrypted_credentials)

    // Get Pinterest board ID from environment
    const boardId = process.env.PINTEREST_BOARD_ID

    // Create Pinterest pin
    const pinterestResponse = await fetch("https://api.pinterest.com/v5/pins", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${credentials.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        board_id: boardId,
        media_source: {
          source_type: "image_url",
          url: post.image_url,
        },
        description: post.pin_description,
        link: post.blogger_url,
        title: post.title,
      }),
    })

    if (!pinterestResponse.ok) {
      const error = await pinterestResponse.text()
      throw new Error(`Pinterest API error: ${error}`)
    }

    const pinterestData = await pinterestResponse.json()

    // Update post in database
    await sql`
      UPDATE gift_posts 
      SET 
        status = 'gepostet_komplett',
        pinterest_url = ${`https://pinterest.com/pin/${pinterestData.id}`},
        pinterest_pin_id = ${pinterestData.id},
        published_pinterest_at = NOW(),
        updated_at = NOW()
      WHERE id = ${id}
    `

    // Log activity
    await sql`
      INSERT INTO activity_logs (post_id, user_id, action, details)
      VALUES (${id}, ${session.user.id}, 'published_pinterest', ${JSON.stringify({
        pinterest_url: `https://pinterest.com/pin/${pinterestData.id}`,
        pinterest_pin_id: pinterestData.id,
      })})
    `

    return NextResponse.json({
      success: true,
      pinterest: {
        url: `https://pinterest.com/pin/${pinterestData.id}`,
        pinId: pinterestData.id,
        publishedAt: new Date().toISOString(),
      },
      message: "Pin erfolgreich auf Pinterest erstellt",
    })
  } catch (error) {
    console.error("Error publishing to Pinterest:", error)
    return NextResponse.json({ error: "Fehler beim Erstellen des Pinterest Pins" }, { status: 500 })
  }
}
