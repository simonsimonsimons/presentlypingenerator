import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

// Mock database - in production, use MongoDB, PostgreSQL, etc.
const posts = [
  {
    id: 1,
    title: "Geschenke für Kaffeeliebhaber",
    status: "freigegeben",
    createdAt: "2024-01-15",
    createdBy: "user1",
    theme: {
      anlass: "Geburtstag",
      hobby: "Kaffee",
      alter: "erwachsene",
      budget: "50-100€",
      stil: "praktisch",
    },
    blogHtml: "<h1>Die besten Geschenke für Kaffeeliebhaber</h1><p>Kaffee ist mehr als nur ein Getränk...</p>",
    pinDescription:
      "Entdecke die perfekten Geschenke für Kaffeeliebhaber! Von hochwertigen Bohnen bis zu innovativen Zubereitungsmethoden.",
    pinTags: ["#Kaffee", "#Geschenke", "#Kaffeeliebhaber", "#Geburtstag"],
    imageUrl: "/placeholder.svg?height=400&width=600",
    bloggerUrl: "https://blog.example.com/kaffee-geschenke",
    pinterestUrl: "https://pinterest.com/pin/123456",
    logs: [
      { action: "created", user: "user1", timestamp: "2024-01-15T10:00:00Z" },
      { action: "text_generated", user: "user1", timestamp: "2024-01-15T10:30:00Z" },
      { action: "image_generated", user: "user1", timestamp: "2024-01-15T11:00:00Z" },
      { action: "approved", user: "reviewer1", timestamp: "2024-01-15T14:00:00Z" },
      { action: "published_blogger", user: "user1", timestamp: "2024-01-15T15:00:00Z" },
      { action: "published_pinterest", user: "user1", timestamp: "2024-01-15T15:30:00Z" },
    ],
  },
]

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")

    let filteredPosts = posts
    if (status) {
      filteredPosts = posts.filter((post) => post.status === status)
    }

    // If database is available, use real data
    if (process.env.DATABASE_URL && session?.user) {
      try {
        const { neon } = await import("@neondatabase/serverless")
        const sql = neon(process.env.DATABASE_URL)

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

        const dbPosts = await sql(query)

        // Parse JSON fields
        const formattedPosts = dbPosts.map((post) => ({
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
      } catch (dbError) {
        console.error("Database error, falling back to mock data:", dbError)
      }
    }

    return NextResponse.json({ posts: filteredPosts })
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

    // If database is available, use real database
    if (process.env.DATABASE_URL) {
      try {
        const { neon } = await import("@neondatabase/serverless")
        const sql = neon(process.env.DATABASE_URL)

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
      } catch (dbError) {
        console.error("Database error:", dbError)
      }
    }

    // Fallback to mock creation
    const newPost = {
      id: posts.length + 1,
      title: body.title,
      status: "neu",
      createdAt: new Date().toISOString().split("T")[0],
      createdBy: "current_user",
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
          user: "current_user",
          timestamp: new Date().toISOString(),
        },
      ],
    }

    posts.push(newPost)
    return NextResponse.json({ success: true, post: newPost }, { status: 201 })
  } catch (error) {
    console.error("Error creating post:", error)
    return NextResponse.json({ error: "Fehler beim Erstellen des Posts" }, { status: 500 })
  }
}
