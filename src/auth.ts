import NeonAdapter from '@auth/neon-adapter'
import NextAuth, { type NextAuthConfig } from 'next-auth'
import Apple from 'next-auth/providers/apple'
import Google from 'next-auth/providers/google'
import { createPool } from '@/lib/db'

const providers: NonNullable<NextAuthConfig['providers']> = [
  Google({
    clientId: process.env.GOOGLE_CLIENT_ID ?? '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
  }),
]

if (process.env.APPLE_ID && process.env.APPLE_SECRET) {
  providers.push(
    Apple({
      clientId: process.env.APPLE_ID,
      clientSecret: process.env.APPLE_SECRET,
    })
  )
}

export const { handlers, auth, signIn, signOut } = NextAuth(() => {
  const pool = createPool()
  return {
    adapter: NeonAdapter(pool),
    providers,
    session: { strategy: 'jwt', maxAge: 30 * 24 * 60 * 60 },
    secret: process.env.AUTH_SECRET,
    trustHost: true,
    callbacks: {
      async jwt({ token, user }) {
        if (user?.id) {
          token.sub = String(user.id)
        }
        return token
      },
      async session({ session, token }) {
        if (session.user && token.sub) {
          session.user.id = token.sub
        }
        return session
      },
    },
  }
})
