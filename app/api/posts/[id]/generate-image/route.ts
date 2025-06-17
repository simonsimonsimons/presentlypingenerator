import { type NextRequest, NextResponse } from "next/server"
import puppeteer from "puppeteer"
import { GoogleAuth } from "google-auth-library"

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    // Get post from database to get theme and title
    const post = await getPostFromDatabase(id)
    if (!post) {
      return NextResponse.json({ error: "Post nicht gefunden" }, { status: 404 })
    }

    // Generate image with Vertex AI
    const imageUrl = await generateImageWithVertexAI(post.theme)

    // Create text overlay with Puppeteer
    const finalImageUrl = await createTextOverlay(imageUrl, post.title, post.theme)

    // Update post in database
    await updatePostInDatabase(id, {
      status: "bild_generiert",
      image_url: finalImageUrl,
      image_alt_text: `${post.title} - Geschenkideen Übersicht`,
    })

    return NextResponse.json({
      success: true,
      image: {
        imageUrl: finalImageUrl,
        altText: `${post.title} - Geschenkideen Übersicht`,
      },
      message: "Bild mit Text-Overlay erfolgreich generiert",
    })
  } catch (error) {
    console.error("Error generating image:", error)
    return NextResponse.json({ error: "Fehler bei der Bildgenerierung" }, { status: 500 })
  }
}

async function generateImageWithVertexAI(theme: any): Promise<string> {
  const auth = new GoogleAuth({
    scopes: ["https://www.googleapis.com/auth/cloud-platform"],
    credentials: process.env.GOOGLE_CLOUD_CREDENTIALS
      ? JSON.parse(Buffer.from(process.env.GOOGLE_CLOUD_CREDENTIALS, "base64").toString())
      : undefined,
  })

  const authClient = await auth.getClient()
  const projectId = process.env.VERTEX_AI_PROJECT
  const location = process.env.VERTEX_AI_LOCATION || "us-central1"

  const prompt = `Professional product photography showing gift ideas for ${theme.hobby} enthusiasts.
Style: ${theme.stil}, occasion: ${theme.anlass}, budget range: ${theme.budget}.
Flat lay arrangement on clean white background, soft natural lighting, high quality, Pinterest-ready.
No text overlays, products only, commercial photography style.`

  const response = await authClient.request({
    url: `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/google/models/imagegeneration:predict`,
    method: "POST",
    data: {
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
    },
  })

  const imageBase64 = response.data.predictions[0].bytesBase64Encoded

  // Upload to Vercel Blob or your storage
  const imageUrl = await uploadImageToStorage(imageBase64)
  return imageUrl
}

async function createTextOverlay(imageUrl: string, title: string, theme: any): Promise<string> {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  })

  try {
    const page = await browser.newPage()
    await page.setViewport({ width: 800, height: 600 })

    // Create HTML template for Pinterest-style overlay
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body {
              margin: 0;
              padding: 0;
              font-family: 'Arial', sans-serif;
              background: white;
            }
            .container {
              position: relative;
              width: 800px;
              height: 600px;
              overflow: hidden;
            }
            .background-image {
              width: 100%;
              height: 100%;
              object-fit: cover;
            }
            .overlay {
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              background: linear-gradient(180deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0) 100%);
              padding: 40px;
              color: white;
            }
            .title {
              font-size: 42px;
              font-weight: bold;
              line-height: 1.2;
              margin-bottom: 15px;
              text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
            }
            .subtitle {
              font-size: 18px;
              opacity: 0.9;
              text-shadow: 1px 1px 2px rgba(0,0,0,0.8);
            }
            .badge {
              position: absolute;
              bottom: 30px;
              right: 30px;
              background: #ff6b6b;
              color: white;
              padding: 8px 16px;
              border-radius: 20px;
              font-size: 14px;
              font-weight: bold;
              text-shadow: none;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <img src="${imageUrl}" alt="Background" class="background-image" crossorigin="anonymous">
            <div class="overlay">
              <div class="title">${title}</div>
              <div class="subtitle">${theme.anlass} • ${theme.budget}</div>
            </div>
            <div class="badge">${theme.hobby.toUpperCase()}</div>
          </div>
        </body>
      </html>
    `

    await page.setContent(html)
    await page.waitForSelector(".container")

    // Wait for image to load
    await page.waitForFunction(() => {
      const img = document.querySelector(".background-image") as HTMLImageElement
      return img && img.complete
    })

    const screenshot = await page.screenshot({
      type: "png",
      clip: { x: 0, y: 0, width: 800, height: 600 },
    })

    // Upload final image
    const finalImageUrl = await uploadImageToStorage(screenshot.toString("base64"))
    return finalImageUrl
  } finally {
    await browser.close()
  }
}

async function uploadImageToStorage(imageData: string): Promise<string> {
  // Using Vercel Blob for image storage
  const { put } = await import("@vercel/blob")

  const buffer = Buffer.from(imageData, "base64")
  const filename = `generated-${Date.now()}.png`

  const blob = await put(filename, buffer, {
    access: "public",
    contentType: "image/png",
  })

  return blob.url
}

// Database functions - implement with your chosen DB
async function getPostFromDatabase(id: string) {
  // Implementation depends on your database choice
  return null
}

async function updatePostInDatabase(id: string, updates: any) {
  // Implementation depends on your database choice
  return null
}
