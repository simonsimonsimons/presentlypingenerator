import { type NextRequest, NextResponse } from "next/server"

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
  const { searchParams } = new URL(request.url)
  const status = searchParams.get("status")

  let filteredPosts = posts
  if (status) {
    filteredPosts = posts.filter((post) => post.status === status)
  }

  return NextResponse.json({ posts: filteredPosts })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const newPost = {
      id: posts.length + 1,
      title: body.title,
      status: "neu",
      createdAt: new Date().toISOString().split("T")[0],
      createdBy: "current_user", // In production, get from auth session
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
    return NextResponse.json({ error: "Failed to create post" }, { status: 500 })
  }
}
