import NextAuth, { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { openDb } from '@/lib/db';

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
        const db = await openDb();
        
        // Create users table if it doesn't exist
        await db.exec(`
          CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            name TEXT,
            picture TEXT,
            googleId TEXT,
            createdAt TEXT DEFAULT (datetime('now')),
            lastLogin TEXT DEFAULT (datetime('now'))
          )
        `);

        // Upsert user
        await db.run(
          `INSERT INTO users (email, name, picture, googleId, lastLogin)
           VALUES (?, ?, ?, ?, datetime('now'))
           ON CONFLICT(email) DO UPDATE SET
             name = excluded.name,
             picture = excluded.picture,
             lastLogin = datetime('now')`,
          [user.email, user.name, user.image, (profile as any)?.sub]
        );
      } catch (error) {
        console.error('Error storing user data:', error);
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
