import NextAuth, { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import crypto from 'crypto';

// Build providers list based on available env vars
const providers: any[] = [];

// Only add Google provider if credentials are configured
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })
  );
}

// Authorized users - email → hashed password
// Default password: "sce2026" — hash: sha256
const AUTHORIZED_USERS: Record<string, { passwordHash: string; name: string }> = {
  'dariuswalton906@gmail.com': {
    passwordHash: crypto.createHash('sha256').update(process.env.SCE_DEFAULT_PASSWORD || 'sce2026').digest('hex'),
    name: 'Darius Walton',
  },
  'demo@sce.com': {
    passwordHash: crypto.createHash('sha256').update(process.env.SCE_DEFAULT_PASSWORD || 'sce2026').digest('hex'),
    name: 'Demo User',
  },
};

// Credentials provider with email + password
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

      const email = credentials.email.toLowerCase().trim();
      const user = AUTHORIZED_USERS[email];

      if (user) {
        // Check password
        const inputHash = crypto.createHash('sha256').update(credentials.password).digest('hex');
        if (inputHash === user.passwordHash) {
          return {
            id: email,
            name: user.name,
            email: email,
          };
        }
      }

      // Allow any email with the correct master password (for team members)
      const masterPassword = process.env.SCE_MASTER_PASSWORD || 'sce2026';
      if (credentials.password === masterPassword) {
        return {
          id: email,
          name: email.split('@')[0],
          email: email,
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
    async redirect({ url, baseUrl }) {
      // Allow relative URLs
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      // Allow URLs on the same origin
      if (new URL(url).origin === baseUrl) return url;
      return baseUrl + '/dashboard';
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
