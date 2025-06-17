// Client-seitige API-Funktionen für die Kommunikation mit den Server-Routen

export class ApiClient {
  // Thema erstellen
  static async createTheme(themeData: any) {
    try {
      const response = await fetch("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(themeData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Fehler beim Erstellen des Themas")
      }

      return await response.json()
    } catch (error) {
      console.error("API Error:", error)
      throw error
    }
  }

  // Text generieren
  static async generateText(postId: string) {
    try {
      const response = await fetch(`/api/posts/${postId}/generate-text`, {
        method: "POST",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Fehler bei der Textgenerierung")
      }

      return await response.json()
    } catch (error) {
      console.error("API Error:", error)
      throw error
    }
  }

  // Bild generieren
  static async generateImage(postId: string) {
    try {
      const response = await fetch(`/api/posts/${postId}/generate-image`, {
        method: "POST",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Fehler bei der Bildgenerierung")
      }

      return await response.json()
    } catch (error) {
      console.error("API Error:", error)
      throw error
    }
  }

  // Post freigeben
  static async approvePost(postId: string, comment = "") {
    try {
      const response = await fetch(`/api/posts/${postId}/approve`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ comment }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Fehler bei der Freigabe")
      }

      return await response.json()
    } catch (error) {
      console.error("API Error:", error)
      throw error
    }
  }

  // Auf Blogger veröffentlichen
  static async publishToBlogger(postId: string) {
    try {
      const response = await fetch(`/api/posts/${postId}/publish/blogger`, {
        method: "POST",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Fehler beim Veröffentlichen auf Blogger")
      }

      return await response.json()
    } catch (error) {
      console.error("API Error:", error)
      throw error
    }
  }

  // Alle Posts laden
  static async getPosts(status?: string) {
    try {
      const url = status ? `/api/posts?status=${status}` : "/api/posts"
      const response = await fetch(url)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Fehler beim Laden der Posts")
      }

      return await response.json()
    } catch (error) {
      console.error("API Error:", error)
      throw error
    }
  }

  // Einzelnen Post laden
  static async getPost(postId: string) {
    try {
      const response = await fetch(`/api/posts/${postId}`)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Fehler beim Laden des Posts")
      }

      return await response.json()
    } catch (error) {
      console.error("API Error:", error)
      throw error
    }
  }
}
