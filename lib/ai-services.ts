// AI Services mit echten API-Aufrufen
import { GoogleGenerativeAI } from "@google/generative-ai"

interface GenerateTextRequest {
  theme: {
    anlass: string
    hobby: string
    alter: string
    budget: string
    stil: string
    beruf?: string
    zusatzinfo?: string
  }
}

interface GenerateTextResponse {
  blogHtml: string
  pinDescription: string
  pinTags: string[]
}

export class AIServices {
  // Google Gemini für Textgenerierung
  static async generateText(request: GenerateTextRequest): Promise<GenerateTextResponse> {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
    const model = genAI.getGenerativeModel({ model: "gemini-pro" })

    const { theme } = request

    const prompt = `
Erstelle einen SEO-optimierten Blog-Artikel über Geschenkideen für ${theme.hobby}-Liebhaber zum Anlass ${theme.anlass}.

Zielgruppe: ${theme.alter}
Budget: ${theme.budget}
Stil: ${theme.stil}
${theme.beruf ? `Beruf: ${theme.beruf}` : ""}
${theme.zusatzinfo ? `Zusätzliche Info: ${theme.zusatzinfo}` : ""}

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

    try {
      const parsedContent = JSON.parse(text)
      return {
        blogHtml: parsedContent.blogHtml,
        pinDescription: parsedContent.pinDescription,
        pinTags: parsedContent.pinTags,
      }
    } catch (error) {
      throw new Error("Failed to parse AI response")
    }
  }

  // Vertex AI für Bildgenerierung
  static async generateImage(theme: any): Promise<{ imageUrl: string; altText: string }> {
    const prompt = `
Professional product photography showing gift ideas for ${theme.hobby} enthusiasts.
Style: ${theme.stil}, occasion: ${theme.anlass}, budget range: ${theme.budget}.
Composition: Flat lay or arranged display on clean white background.
Lighting: Soft, natural lighting. High quality, Pinterest-ready image.
No text overlays, focus on products only.
`

    // Google Cloud Credentials aus Environment Variable
    const credentials = JSON.parse(process.env.GOOGLE_CLOUD_CREDENTIALS!)

    const response = await fetch(
      `https://${process.env.VERTEX_AI_LOCATION}-aiplatform.googleapis.com/v1/projects/${process.env.VERTEX_AI_PROJECT}/locations/${process.env.VERTEX_AI_LOCATION}/publishers/google/models/imagegeneration:predict`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${await this.getAccessToken(credentials)}`,
        },
        body: JSON.stringify({
          instances: [{ prompt }],
          parameters: {
            sampleCount: 1,
            aspectRatio: "4:3",
            safetyFilterLevel: "block_some",
          },
        }),
      },
    )

    if (!response.ok) {
      throw new Error(`Vertex AI Error: ${response.statusText}`)
    }

    const data = await response.json()
    const imageBase64 = data.predictions[0].bytesBase64Encoded

    // Bild zu Vercel Blob hochladen
    const { BlobStorage } = await import("./storage")
    const imageBuffer = Buffer.from(imageBase64, "base64")
    const filename = `${Date.now()}-${theme.hobby.toLowerCase()}.png`
    const imageUrl = await BlobStorage.saveImage(imageBuffer, filename)

    return {
      imageUrl,
      altText: `Geschenkideen für ${theme.hobby}-Liebhaber`,
    }
  }

  private static async getAccessToken(credentials: any): Promise<string> {
    const { GoogleAuth } = await import("google-auth-library")
    const auth = new GoogleAuth({
      credentials,
      scopes: ["https://www.googleapis.com/auth/cloud-platform"],
    })
    const client = await auth.getClient()
    const token = await client.getAccessToken()
    return token.token!
  }
}
