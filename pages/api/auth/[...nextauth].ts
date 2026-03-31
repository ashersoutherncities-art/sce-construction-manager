import NextAuth, { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { authenticateUser } from '../../../lib/auth';

// Log environment state at startup
if (process.env.NODE_ENV === 'production') {
  console.error('[NextAuth STARTUP] Production environment detected');
  console.error('[NextAuth STARTUP] GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? 'SET' : 'MISSING');
  console.error('[NextAuth STARTUP] GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET ? 'SET' : 'MISSING');
  console.error('[NextAuth STARTUP] NEXTAUTH_URL:', process.env.NEXTAUTH_URL);
  console.error('[NextAuth STARTUP] NEXTAUTH_SECRET:', process.env.NEXTAUTH_SECRET ? 'SET' : 'MISSING');
}

// Build providers list based on available env vars
const providers: any[] = [];

// Google OAuth provider - only add if credentials are configured
console.log('[NextAuth] Checking Google credentials:', {
  hasClientId: !!process.env.GOOGLE_CLIENT_ID,
  hasClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
  clientIdPrefix: process.env.GOOGLE_CLIENT_ID?.substring(0, 20),
  clientSecretPrefix: process.env.GOOGLE_CLIENT_SECRET?.substring(0, 20),
});

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  console.log('[NextAuth] Google provider ENABLED');
  try {
    const googleProvider = GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code',
        },
      },
      // Use nonce check instead of state/PKCE - nonce is verified via the
      // ID token and doesn't depend on cookies surviving the redirect chain.
      // This fixes "State cookie was missing" errors on Vercel serverless.
      checks: ['nonce'],
    });
    console.log('[NextAuth] Google provider created successfully');
    providers.push(googleProvider);
  } catch (err) {
    console.error('[NextAuth] Failed to create Google provider:', err);
  }
} else {
  console.error('[NextAuth] Google provider DISABLED - missing credentials!', {
    hasId: !!process.env.GOOGLE_CLIENT_ID,
    hasSecret: !!process.env.GOOGLE_CLIENT_SECRET,
    NODE_ENV: process.env.NODE_ENV,
  });
  // Don't add Google provider if credentials are missing
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
    signOut: '/',
  },
  debug: process.env.NODE_ENV === 'development' || process.env.NEXTAUTH_DEBUG === 'true',
  events: {
    async signIn({ user, account, profile }) {
      console.log('[NextAuth Event] signIn:', { provider: account?.provider, email: user?.email });
    },
    async error({ error }) {
      console.error('[NextAuth Event] error:', error);
    },
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      // Log for debugging
      console.log('[NextAuth] signIn callback:', {
        provider: account?.provider,
        email: user?.email,
        hasProfile: !!profile,
        userId: user?.id,
        userName: user?.name,
      });
      if (!user || !account) {
        console.error('[NextAuth] signIn FAILED: missing user or account', { hasUser: !!user, hasAccount: !!account });
        return false;
      }
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
        (session.user as any).id = token.id || token.sub;
        (session.user as any).provider = token.provider;
        // Ensure user properties are correctly set from token
        if (token.name) session.user.name = token.name;
        if (token.email) session.user.email = token.email;
        if (token.picture) session.user.image = token.picture;
      }
      return session;
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id || token.sub;
        token.name = user.name;
        token.email = user.email;
        token.picture = (user as any).image;
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
  // Fix "State cookie was missing" on Vercel serverless:
  // Drop the __Secure-/__Host- prefix so the nonce/state cookie isn't
  // silently stripped by certain browsers during the cross-site OAuth
  // redirect chain (Google → our callback).
  cookies: {
    sessionToken: {
      name: 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax' as const,
        path: '/',
        secure: true,
      },
    },
    csrfToken: {
      name: 'next-auth.csrf-token',
      options: {
        httpOnly: true,
        sameSite: 'lax' as const,
        path: '/',
        secure: true,
      },
    },
    callbackUrl: {
      name: 'next-auth.callback-url',
      options: {
        httpOnly: true,
        sameSite: 'lax' as const,
        path: '/',
        secure: true,
      },
    },
    state: {
      name: 'next-auth.state',
      options: {
        httpOnly: true,
        sameSite: 'lax' as const,
        path: '/',
        secure: true,
        maxAge: 900,
      },
    },
    nonce: {
      name: 'next-auth.nonce',
      options: {
        httpOnly: true,
        sameSite: 'lax' as const,
        path: '/',
        secure: true,
      },
    },
  },
};

// Export with error handling
const handler = NextAuth(authOptions);

// Log all OAuth errors for debugging
export default handler;
