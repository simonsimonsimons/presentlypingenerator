import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const limit = Number.parseInt(searchParams.get("limit") || "20")
    const offset = Number.parseInt(searchParams.get("offset") || "0")

    let query = `
      SELECT gp.*, u.name as creator_name, u.email as creator_email
      FROM gift_posts gp
      JOIN users u ON u.id = gp.created_by
      WHERE gp.created_by = ${session.user.id}
    `

    if (status) {
      query += ` AND gp.status = '${status}'`
    }

    query += ` ORDER BY gp.created_at DESC LIMIT ${limit} OFFSET ${offset}`

    const posts = await sql(query)

    // Parse JSON fields
    const formattedPosts = posts.map((post) => ({
      ...post,
      pin_tags: post.pin_tags ? JSON.parse(post.pin_tags) : [],
      theme: {
        anlass: post.anlass,
        hobby: post.hobby,
        alter: post.alter,
        budget: post.budget,
        stil: post.stil,
        beruf: post.beruf,
        zusatzinfo: post.zusatzinfo,
      },
    }))

    return NextResponse.json({ posts: formattedPosts })
  } catch (error) {
    console.error("Error fetching posts:", error)
    return NextResponse.json({ error: "Fehler beim Laden der Posts" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()

    const result = await sql`
      INSERT INTO gift_posts (
        title, created_by, anlass, hobby, alter, budget, stil, beruf, zusatzinfo
      ) VALUES (
        ${body.title},
        ${session.user.id},
        ${body.anlass},
        ${body.hobby},
        ${body.alter},
        ${body.budget},
        ${body.stil},
        ${body.beruf || null},
        ${body.zusatzinfo || null}
      ) RETURNING *
    `

    const newPost = result[0]

    // Log activity
    await sql`
      INSERT INTO activity_logs (post_id, user_id, action, details)
      VALUES (${newPost.id}, ${session.user.id}, 'created', ${JSON.stringify({
        title: body.title,
        theme: {
          anlass: body.anlass,
          hobby: body.hobby,
          alter: body.alter,
          budget: body.budget,
          stil: body.stil,
        },
      })})
    `

    return NextResponse.json({ success: true, post: newPost }, { status: 201 })
  } catch (error) {
    console.error("Error creating post:", error)
    return NextResponse.json({ error: "Fehler beim Erstellen des Posts" }, { status: 500 })
  }
}
