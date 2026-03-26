import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

// Build providers list based on available env vars
const providers: any[] = [];

// Only add Google provider if credentials are configured
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  // Dynamic import to avoid issues when not configured
  const GoogleProvider = require('next-auth/providers/google').default;
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })
  );
}

// Always provide a credentials provider as fallback for demo/development
providers.push(
  CredentialsProvider({
    name: 'Demo Access',
    credentials: {
      email: { label: 'Email', type: 'email', placeholder: 'demo@sce.com' },
    },
    async authorize(credentials) {
      // Allow demo access - in production, add proper validation
      if (credentials?.email) {
        return {
          id: '1',
          name: credentials.email.split('@')[0],
          email: credentials.email,
        };
      }
      return null;
    },
  })
);

export const authOptions: NextAuthOptions = {
  providers,
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async signIn({ user }) {
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
  // NEXTAUTH_SECRET is REQUIRED in production. Use env var or fallback for initial deploy.
  secret: process.env.NEXTAUTH_SECRET || 'sce-construction-manager-default-secret-change-me',
};

export default NextAuth(authOptions);
