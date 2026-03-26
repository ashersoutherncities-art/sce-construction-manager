import NextAuth, { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { sql } from '@vercel/postgres';

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      try {
        // Upsert user in PostgreSQL
        await sql`
          INSERT INTO users (email, name, picture, googleId, lastLogin)
          VALUES (${user.email}, ${user.name}, ${user.image}, ${(profile as any)?.sub}, NOW())
          ON CONFLICT(email) DO UPDATE SET
            name = EXCLUDED.name,
            picture = EXCLUDED.picture,
            lastLogin = NOW()
        `;
      } catch (error) {
        console.error('Error storing user:', error);
        // Don't block sign-in if DB write fails
      }
      return true;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.sub;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export default NextAuth(authOptions);
