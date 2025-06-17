import { type NextRequest, NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    // Get post from database
    const posts = await sql`
      SELECT * FROM gift_posts WHERE id = ${id} AND created_by = ${session.user.id}
    `

    if (posts.length === 0) {
      return NextResponse.json({ error: "Post nicht gefunden" }, { status: 404 })
    }

    const post = posts[0]

    // Generate content with Gemini
    const model = genAI.getGenerativeModel({ model: "gemini-pro" })

    const prompt = `
Erstelle einen SEO-optimierten Blog-Artikel über Geschenkideen für ${post.hobby}-Liebhaber zum Anlass ${post.anlass}.

Zielgruppe: ${post.alter}
Budget: ${post.budget}
Stil: ${post.stil}
${post.beruf ? `Beruf: ${post.beruf}` : ""}
${post.zusatzinfo ? `Zusätzliche Info: ${post.zusatzinfo}` : ""}

Der Artikel soll folgende Struktur haben:
1. Einleitung mit emotionalem Hook (2-3 Sätze)
2. 5-7 konkrete Geschenkideen mit Beschreibungen
3. Kaufberatung und Tipps
4. Kurzes Fazit

Schreibstil: freundlich, informativ, verkaufsorientiert.
Format: HTML mit h1, h2, p Tags.

Zusätzlich erstelle:
- Eine Pinterest Pin-Beschreibung (2-3 Sätze, emotional, mit Call-to-Action)
- 8-12 relevante Hashtags für Pinterest

Antworte im JSON Format:
{
  "blogHtml": "...",
  "pinDescription": "...",
  "pinTags": ["#tag1", "#tag2", ...]
}
`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    // Parse JSON response
    let parsedContent
    try {
      parsedContent = JSON.parse(text)
    } catch (parseError) {
      // Fallback if AI doesn't return valid JSON
      parsedContent = {
        blogHtml: `<h1>${post.title}</h1><p>${text}</p>`,
        pinDescription: `Entdecke die besten Geschenkideen für ${post.hobby}-Liebhaber!`,
        pinTags: [`#${post.hobby}`, `#${post.anlass}`, "#Geschenke"],
      }
    }

    // Update post in database
    await sql`
      UPDATE gift_posts 
      SET 
        status = 'text_generiert',
        blog_html = ${parsedContent.blogHtml},
        pin_description = ${parsedContent.pinDescription},
        pin_tags = ${JSON.stringify(parsedContent.pinTags)},
        updated_at = NOW()
      WHERE id = ${id}
    `

    // Log activity
    await sql`
      INSERT INTO activity_logs (post_id, user_id, action, details)
      VALUES (${id}, ${session.user.id}, 'text_generated', ${JSON.stringify({
        ai_model: "gemini-pro",
        tokens_used: result.response.usageMetadata?.totalTokenCount || 0,
      })})
    `

    return NextResponse.json({
      success: true,
      content: parsedContent,
      message: "Text erfolgreich generiert",
    })
  } catch (error) {
    console.error("Error generating text:", error)
    return NextResponse.json({ error: "Fehler bei der Textgenerierung" }, { status: 500 })
  }
}
