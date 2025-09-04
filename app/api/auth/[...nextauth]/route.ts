import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import bcrypt from "bcryptjs"

const handler = NextAuth({
  providers: [
    // Google OAuth Provider
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    // Credentials Provider (fallback)
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: "Username", type: "text", placeholder: "admin" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // Check if credentials are provided
        if (!credentials?.username || !credentials?.password) {
          return null
        }

        // Get admin credentials from environment variables
        const adminUsername = process.env.ADMIN_USERNAME || "admin"
        const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH

        // Fallback to hardcoded for development (remove in production!)
        const fallbackHash = await bcrypt.hash("password", 10)
        const passwordHash = adminPasswordHash || fallbackHash

        // Verify username
        if (credentials.username !== adminUsername) {
          return null
        }

        // Verify password using bcrypt
        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          passwordHash
        )

        if (!isPasswordValid) {
          return null
        }

        // Return user object if authentication successful
        return {
          id: "1",
          name: adminUsername,
          email: `${adminUsername}@stoopside.com`
        }
      }
    })
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // For Google OAuth, check if email is authorized
      if (account?.provider === "google") {
        const authorizedEmails = process.env.AUTHORIZED_EMAILS?.split(",").map(e => e.trim()) || []
        
        // If no authorized emails configured, allow all (be careful!)
        if (authorizedEmails.length === 0) {
          console.warn("No AUTHORIZED_EMAILS configured - allowing all Google logins")
          return true
        }
        
        // Check if user email is in authorized list
        if (user.email && authorizedEmails.includes(user.email)) {
          return true
        }
        
        // Reject unauthorized emails
        return false
      }
      
      // Allow credentials provider
      return true
    },
    async session({ session, token }) {
      // Add custom session properties if needed
      return session
    },
    async jwt({ token, account }) {
      // Store provider info in token
      if (account) {
        token.provider = account.provider
      }
      return token
    }
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/signin', // Redirect auth errors to signin page
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
})

export { handler as GET, handler as POST }