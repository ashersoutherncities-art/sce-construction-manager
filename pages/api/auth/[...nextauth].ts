import NextAuth, { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { authenticateUser } from '../../../lib/auth';

// Build providers list based on available env vars
const providers: any[] = [];

// Google OAuth provider - only add if credentials are configured
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code',
        },
      },
      // Use 'state' instead of PKCE to avoid cookie issues on Vercel
      checks: ['state'],
    })
  );
}

// Credentials provider with email + bcrypt password verification
providers.push(
  CredentialsProvider({
    name: 'Email & Password',
    credentials: {
      email: { label: 'Email', type: 'email', placeholder: 'your@email.com' },
      password: { label: 'Password', type: 'password' },
    },
    async authorize(credentials) {
      if (!credentials?.email || !credentials?.password) {
        return null;
      }

      // Authenticate using bcrypt-hashed passwords
      const user = await authenticateUser(credentials.email, credentials.password);
      return user;
    },
  })
);

export const authOptions: NextAuthOptions = {
  providers,
  pages: {
    signIn: '/login',
    error: '/login', // Redirect OAuth errors to login page with error param
  },
  debug: process.env.NODE_ENV === 'development' || process.env.NEXTAUTH_DEBUG === 'true',
  callbacks: {
    async signIn({ user, account, profile }) {
      // Log for debugging
      console.log('[NextAuth] signIn callback:', {
        provider: account?.provider,
        email: user?.email,
        hasProfile: !!profile,
      });
      // Allow any Google account to sign in
      return true;
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      try {
        if (new URL(url).origin === baseUrl) return url;
      } catch {
        // Invalid URL, fall through to default
      }
      return baseUrl + '/dashboard';
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.sub;
        (session.user as any).provider = token.provider;
      }
      return session;
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
      }
      if (account) {
        token.provider = account.provider;
      }
      return token;
    },
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export default NextAuth(authOptions);
