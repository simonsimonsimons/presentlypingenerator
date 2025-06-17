// Database connection and query utilities
// This would typically use a proper ORM like Prisma or database client

interface User {
  id: number
  email: string
  name: string
  role: "editor" | "reviewer" | "admin"
  google_id?: string
  avatar_url?: string
  created_at: string
  updated_at: string
}

interface GiftPost {
  id: number
  title: string
  status:
    | "neu"
    | "text_generiert"
    | "bild_generiert"
    | "review"
    | "freigegeben"
    | "gepostet_blogger"
    | "gepostet_pinterest"
    | "gepostet_komplett"
  created_by: number
  reviewer_id?: number

  // Theme details
  anlass: string
  hobby: string
  alter: string
  beruf?: string
  stil: string
  budget: string
  zusatzinfo?: string

  // Generated content
  blog_html?: string
  pin_description?: string
  pin_tags?: string[]
  image_url?: string
  image_alt_text?: string

  // Publishing URLs
  blogger_url?: string
  blogger_post_id?: string
  pinterest_url?: string
  pinterest_pin_id?: string

  // Timestamps
  created_at: string
  updated_at: string
  approved_at?: string
  published_blogger_at?: string
  published_pinterest_at?: string
}

interface ActivityLog {
  id: number
  post_id: number
  user_id: number
  action: string
  details?: Record<string, any>
  created_at: string
}

// Mock database functions - replace with actual database queries
export class Database {
  static async getUser(id: number): Promise<User | null> {
    // In production: SELECT * FROM users WHERE id = ?
    return null
  }

  static async getUserByEmail(email: string): Promise<User | null> {
    // In production: SELECT * FROM users WHERE email = ?
    return null
  }

  static async createUser(userData: Partial<User>): Promise<User> {
    // In production: INSERT INTO users (...) VALUES (...)
    throw new Error("Not implemented")
  }

  static async getPost(id: number): Promise<GiftPost | null> {
    // In production: SELECT * FROM gift_posts WHERE id = ?
    return null
  }

  static async getPosts(filters?: {
    status?: string
    created_by?: number
    limit?: number
    offset?: number
  }): Promise<GiftPost[]> {
    // In production: SELECT * FROM gift_posts WHERE ... ORDER BY created_at DESC
    return []
  }

  static async createPost(postData: Partial<GiftPost>): Promise<GiftPost> {
    // In production: INSERT INTO gift_posts (...) VALUES (...)
    throw new Error("Not implemented")
  }

  static async updatePost(id: number, updates: Partial<GiftPost>): Promise<GiftPost> {
    // In production: UPDATE gift_posts SET ... WHERE id = ?
    throw new Error("Not implemented")
  }

  static async logActivity(logData: Partial<ActivityLog>): Promise<ActivityLog> {
    // In production: INSERT INTO activity_logs (...) VALUES (...)
    throw new Error("Not implemented")
  }

  static async getActivityLogs(postId: number): Promise<ActivityLog[]> {
    // In production: SELECT * FROM activity_logs WHERE post_id = ? ORDER BY created_at DESC
    return []
  }
}

// Environment configuration
export const config = {
  database: {
    url: process.env.DATABASE_URL || "postgresql://localhost:5432/presently",
    ssl: process.env.NODE_ENV === "production",
  },
  ai: {
    gemini_api_key: process.env.GEMINI_API_KEY,
    vertex_ai_project: process.env.VERTEX_AI_PROJECT,
    vertex_ai_location: process.env.VERTEX_AI_LOCATION || "us-central1",
  },
  oauth: {
    google_client_id: process.env.GOOGLE_CLIENT_ID,
    google_client_secret: process.env.GOOGLE_CLIENT_SECRET,
    blogger_api_key: process.env.BLOGGER_API_KEY,
    pinterest_app_id: process.env.PINTEREST_APP_ID,
    pinterest_app_secret: process.env.PINTEREST_APP_SECRET,
  },
  affiliate: {
    amazon_tag: process.env.AMAZON_AFFILIATE_TAG || "presently-21",
  },
}
