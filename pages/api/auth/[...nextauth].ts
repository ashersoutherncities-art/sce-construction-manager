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
      allowDangerousEmailAccountLinking: true, // Allow linking Gmail accounts
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
      profile(profile) {
        // Explicitly map Google profile to NextAuth user object
        console.log('[NextAuth] [GoogleProvider] Mapping profile to user:', {
          googleSub: profile.sub,
          googleEmail: profile.email,
          googleName: profile.name,
          googlePicture: profile.picture,
        });
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
        };
      },
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
  // CRITICAL: Enable debug mode for better logging
  debug: true,
  events: {
    async signIn({ user, account, profile }) {
      console.log('[NextAuth Event] signIn:', { provider: account?.provider, email: user?.email });
    },
    async error({ error }) {
      console.error('[NextAuth Event] error:', error);
    },
  },
  callbacks: {
    async signIn({ user, account, profile, credentials }) {
      const timestamp = new Date().toISOString();
      console.log(`[${timestamp}] [NextAuth] ===== SIGNIN CALLBACK START =====`);
      console.log(`[${timestamp}] [NextAuth] signIn input:`, {
        provider: account?.provider,
        email: user?.email,
        hasProfile: !!profile,
        userId: user?.id,
        userName: user?.name,
        accountType: account?.type,
        credentialsProvider: credentials ? 'credentials' : 'oauth',
      });
      
      // Log the full objects for debugging
      console.log(`[${timestamp}] [NextAuth] Full user object:`, JSON.stringify(user, null, 2));
      console.log(`[${timestamp}] [NextAuth] Full account object:`, JSON.stringify(account, null, 2));
      if (profile) console.log(`[${timestamp}] [NextAuth] Full profile object:`, JSON.stringify(profile, null, 2));
      
      if (!user) {
        console.error(`[${timestamp}] [NextAuth] signIn FAILED: user is null/undefined`);
        return false;
      }
      
      if (!account && !credentials) {
        // account is null AND not using credentials provider = error
        console.error(`[${timestamp}] [NextAuth] signIn FAILED: no account and not using credentials`);
        return false;
      }
      
      if (credentials) {
        console.log(`[${timestamp}] [NextAuth] signIn using credentials provider`);
      }
      
      if (account && !account.provider) {
        console.error(`[${timestamp}] [NextAuth] signIn FAILED: account has no provider`);
        return false;
      }
      
      // CRITICAL: Ensure user object has an ID for OAuth providers
      // NextAuth should auto-populate this from profile.sub (Google uses sub as unique ID)
      // but we'll verify it's set
      if (account && !user.id) {
        console.error(`[${timestamp}] [NextAuth] WARNING: OAuth user missing ID - using email as fallback`);
        user.id = user.email || 'unknown';
      }
      
      console.log(`[${timestamp}] [NextAuth] signIn callback RETURNING TRUE - user allowed with ID: ${user.id}`);
      return true;
    },
    async redirect({ url, baseUrl }) {
      const timestamp = new Date().toISOString();
      console.log(`[${timestamp}] [NextAuth] ===== REDIRECT CALLBACK START =====`);
      console.log(`[${timestamp}] [NextAuth] redirect input:`, { url, baseUrl });
      
      // Always redirect to dashboard - let the middleware handle login redirects
      const dashboard = `${baseUrl}/dashboard`;
      console.log(`[${timestamp}] [NextAuth] redirect: Always redirecting to dashboard:`, dashboard);
      return dashboard;
    },
    async session({ session, token }) {
      const timestamp = new Date().toISOString();
      console.log(`[${timestamp}] [NextAuth] ===== SESSION CALLBACK START =====`);
      console.log(`[${timestamp}] [NextAuth] session input:`, {
        hasSession: !!session,
        hasToken: !!token,
        tokenId: token?.id,
        tokenSub: token?.sub,
        tokenEmail: token?.email,
        tokenProvider: token?.provider,
        sessionEmail: session?.user?.email,
      });
      
      if (session.user) {
        (session.user as any).id = token.id || token.sub;
        (session.user as any).provider = token.provider;
        if (token.name) session.user.name = token.name;
        if (token.email) session.user.email = token.email;
        if (token.picture) session.user.image = token.picture;
        
        console.log(`[${timestamp}] [NextAuth] session callback POPULATED user properties:`, {
          id: (session.user as any).id,
          email: session.user.email,
          name: session.user.name,
          provider: (session.user as any).provider,
        });
      }
      
      console.log(`[${timestamp}] [NextAuth] session callback RETURNING:`, {
        hasUser: !!session.user,
        userEmail: session.user?.email,
      });
      return session;
    },
    async jwt({ token, user, account, trigger }) {
      const timestamp = new Date().toISOString();
      console.log(`[${timestamp}] [NextAuth] ===== JWT CALLBACK START =====`);
      console.log(`[${timestamp}] [NextAuth] jwt input:`, {
        trigger,
        hasUser: !!user,
        hasAccount: !!account,
        tokenId: token?.id,
        tokenSub: token?.sub,
        userId: user?.id,
        userEmail: user?.email,
        accountProvider: account?.provider,
      });
      
      if (user) {
        token.id = user.id || token.sub;
        token.name = user.name;
        token.email = user.email;
        token.picture = (user as any).image;
        console.log(`[${timestamp}] [NextAuth] jwt callback UPDATED token from user:`, {
          tokenId: token.id,
          tokenEmail: token.email,
          tokenName: token.name,
        });
      }
      if (account) {
        token.provider = account.provider;
        console.log(`[${timestamp}] [NextAuth] jwt callback SET provider to:`, account.provider);
      }
      
      console.log(`[${timestamp}] [NextAuth] jwt callback RETURNING token with:`, {
        id: token.id,
        email: token.email,
        provider: token.provider,
      });
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

// Wrap the handler to log all requests and responses
const handler = NextAuth(authOptions);

// Export the handler
export default handler;
