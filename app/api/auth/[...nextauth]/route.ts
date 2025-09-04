import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    })
  ],
  callbacks: {
    async signIn({ user, account }) {
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
      
      return true
    },
    async session({ session }) {
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