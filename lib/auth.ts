import type { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope:
            "openid email profile https://www.googleapis.com/auth/blogger https://www.googleapis.com/auth/pinterest",
        },
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        try {
          // Only use database if DATABASE_URL is available
          if (process.env.DATABASE_URL) {
            const { neon } = await import("@neondatabase/serverless")
            const sql = neon(process.env.DATABASE_URL)

            // Check if user exists
            const existingUser = await sql`
              SELECT * FROM users WHERE email = ${user.email}
            `

            if (existingUser.length === 0) {
              // Create new user
              await sql`
                INSERT INTO users (email, name, google_id, avatar_url, role)
                VALUES (${user.email}, ${user.name}, ${account.providerAccountId}, ${user.image}, 'editor')
              `
            } else {
              // Update existing user
              await sql`
                UPDATE users 
                SET name = ${user.name}, avatar_url = ${user.image}, updated_at = NOW()
                WHERE email = ${user.email}
              `
            }

            // Store OAuth tokens for API access
            if (account.access_token) {
              await sql`
                INSERT INTO integrations (user_id, service, encrypted_credentials, is_active)
                VALUES (
                  (SELECT id FROM users WHERE email = ${user.email}),
                  'google',
                  ${JSON.stringify({
                    access_token: account.access_token,
                    refresh_token: account.refresh_token,
                    expires_at: account.expires_at,
                  })},
                  true
                )
                ON CONFLICT (user_id, service) 
                DO UPDATE SET 
                  encrypted_credentials = EXCLUDED.encrypted_credentials,
                  updated_at = NOW()
              `
            }
          }

          return true
        } catch (error) {
          console.error("Error during sign in:", error)
          return true // Allow sign in even if database operations fail
        }
      }
      return true
    },
    async session({ session, token }) {
      if (session.user?.email && process.env.DATABASE_URL) {
        try {
          const { neon } = await import("@neondatabase/serverless")
          const sql = neon(process.env.DATABASE_URL)

          const user = await sql`
            SELECT id, role FROM users WHERE email = ${session.user.email}
          `
          if (user.length > 0) {
            session.user.id = user[0].id
            session.user.role = user[0].role
          }
        } catch (error) {
          console.error("Error fetching user session:", error)
        }
      }
      return session
    },
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token
      }
      return token
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  session: {
    strategy: "jwt",
  },
}
