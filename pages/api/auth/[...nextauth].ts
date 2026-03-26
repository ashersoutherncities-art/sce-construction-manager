import NextAuth, { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { query } from '@/lib/postgres';

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
        await query(
          `INSERT INTO users (email, name, picture, googleId, lastLogin)
           VALUES ($1, $2, $3, $4, NOW())
           ON CONFLICT(email) DO UPDATE SET
             name = EXCLUDED.name,
             picture = EXCLUDED.picture,
             lastLogin = NOW()`,
          [user.email, user.name, user.image, (profile as any)?.sub]
        );
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
