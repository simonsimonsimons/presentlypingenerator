// AI service integrations for text and image generation

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
  template?: string
}

interface GenerateTextResponse {
  blogHtml: string
  pinDescription: string
  pinTags: string[]
  tokensUsed: number
}

interface GenerateImageRequest {
  theme: {
    hobby: string
    stil: string
    anlass: string
    budget: string
  }
  prompt?: string
}

interface GenerateImageResponse {
  imageUrl: string
  altText: string
  prompt: string
}

export class AIServices {
  // Google Gemini integration for text generation
  static async generateText(request: GenerateTextRequest): Promise<GenerateTextResponse> {
    const { theme } = request

    // Build prompt from template
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

    try {
      // In production, call Google Gemini API
      const response = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.GEMINI_API_KEY}`,
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [{ text: prompt }],
              },
            ],
            generationConfig: {
              temperature: 0.7,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 2048,
            },
          }),
        },
      )

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.statusText}`)
      }

      const data = await response.json()
      const generatedText = data.candidates[0].content.parts[0].text

      // Parse JSON response from AI
      const parsedContent = JSON.parse(generatedText)

      return {
        blogHtml: parsedContent.blogHtml,
        pinDescription: parsedContent.pinDescription,
        pinTags: parsedContent.pinTags,
        tokensUsed: data.usageMetadata?.totalTokenCount || 0,
      }
    } catch (error) {
      console.error("Error generating text:", error)

      // Fallback mock response for development
      return {
        blogHtml: `
          <h1>Die perfekten Geschenke für ${theme.hobby}-Liebhaber</h1>
          <p>Wenn Sie auf der Suche nach dem idealen Geschenk für einen ${theme.hobby}-Enthusiasten sind, haben wir die besten Ideen für Sie zusammengestellt.</p>
          <h2>Unsere Top-Empfehlungen</h2>
          <p>Diese Geschenke treffen garantiert ins Schwarze und bereiten echte Freude.</p>
        `,
        pinDescription: `Entdecke die besten Geschenkideen für ${theme.hobby}-Liebhaber! Perfekt für ${theme.anlass} im Budget ${theme.budget}. 🎁`,
        pinTags: [`#${theme.hobby}`, `#${theme.anlass}`, "#Geschenke", "#Geschenkideen", "#Shopping"],
        tokensUsed: 1200,
      }
    }
  }

  // Vertex AI Imagen integration for image generation
  static async generateImage(request: GenerateImageRequest): Promise<GenerateImageResponse> {
    const { theme } = request

    const prompt =
      request.prompt ||
      `
Professional product photography showing gift ideas for ${theme.hobby} enthusiasts.
Style: ${theme.stil}, occasion: ${theme.anlass}, budget range: ${theme.budget}.
Composition: Flat lay or arranged display on clean white background.
Lighting: Soft, natural lighting. High quality, Pinterest-ready image.
No text overlays, focus on products only.
`

    try {
      // In production, call Vertex AI Imagen API
      const response = await fetch(
        `https://${process.env.VERTEX_AI_LOCATION}-aiplatform.googleapis.com/v1/projects/${process.env.VERTEX_AI_PROJECT}/locations/${process.env.VERTEX_AI_LOCATION}/publishers/google/models/imagegeneration:predict`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${await this.getVertexAIToken()}`,
          },
          body: JSON.stringify({
            instances: [
              {
                prompt: prompt,
              },
            ],
            parameters: {
              sampleCount: 1,
              aspectRatio: "4:3",
              safetyFilterLevel: "block_some",
              personGeneration: "dont_allow",
            },
          }),
        },
      )

      if (!response.ok) {
        throw new Error(`Vertex AI error: ${response.statusText}`)
      }

      const data = await response.json()
      const imageBase64 = data.predictions[0].bytesBase64Encoded

      // In production, upload to cloud storage and return URL
      const imageUrl = await this.uploadImageToStorage(imageBase64)

      return {
        imageUrl,
        altText: `Geschenkideen für ${theme.hobby}-Liebhaber`,
        prompt,
      }
    } catch (error) {
      console.error("Error generating image:", error)

      // Fallback placeholder for development
      return {
        imageUrl: `/placeholder.svg?height=600&width=800&text=${encodeURIComponent(theme.hobby + " Geschenke")}`,
        altText: `Geschenkideen für ${theme.hobby}-Liebhaber`,
        prompt,
      }
    }
  }

  private static async getVertexAIToken(): Promise<string> {
    // In production, implement Google Cloud authentication
    // This would typically use service account credentials
    return "mock_token"
  }

  private static async uploadImageToStorage(imageBase64: string): Promise<string> {
    // In production, upload to Google Cloud Storage, AWS S3, etc.
    // Return the public URL of the uploaded image
    return "/placeholder.svg?height=600&width=800&text=Generated+Image"
  }
}
