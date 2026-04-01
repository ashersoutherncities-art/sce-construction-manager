import NextAuth, { type NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { authenticateUser } from '../../../lib/auth';

// Verify env vars exist
console.log('[NextAuth] Startup check:', {
  googleClientId: process.env.GOOGLE_CLIENT_ID ? '✅' : '❌',
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET ? '✅' : '❌',
  nextAuthUrl: process.env.NEXTAUTH_URL || 'NOT SET',
  nextAuthSecret: process.env.NEXTAUTH_SECRET ? '✅' : '❌',
});

export const authOptions: NextAuthOptions = {
  // Use JWT strategy - no database required
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  // Session secret
  secret: process.env.NEXTAUTH_SECRET,

  // NextAuth pages
  pages: {
    signIn: '/login',
    error: '/login',
  },

  // Providers
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      allowDangerousEmailAccountLinking: true,
      // ✅ CRITICAL FIX: Use state check ONLY (not nonce)
      // Nonce causes "SessionRequired" on Vercel serverless
      checks: ['state'],
      // Don't use pkce - causes state mismatch on serverless
      skipUserInfoRequest: false,
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password required');
        }
        return await authenticateUser(credentials.email, credentials.password);
      },
    }),
  ],

  // ✅ CRITICAL FIX: Disable nonce cookie entirely
  // Nonce cookie gets lost in Vercel serverless redirects
  cookies: {
    pkceCodeVerifier: {
      name: 'next-auth.pkce.code_verifier',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 900,
      },
    },
  },

  // Callbacks
  callbacks: {
    async signIn({ user, account, profile }) {
      console.log('[NextAuth] signIn callback:', {
        provider: account?.provider,
        email: user?.email,
      });
      
      if (!user?.email) {
        console.error('[NextAuth] signIn FAILED: no email');
        return false;
      }

      // For Google OAuth, auto-create user if they don't exist
      if (account?.provider === 'google') {
        try {
          const prisma = (await import('@/lib/prisma')).default;
          
          // Check if user exists
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email },
          });

          // If user doesn't exist, create them
          if (!existingUser) {
            console.log('[NextAuth] Creating new user from Google signup:', user.email);
            const newUser = await prisma.user.create({
              data: {
                email: user.email,
                name: user.name || 'Google User',
                image: user.image,
                role: 'USER',
                emailVerified: new Date(), // Google email is already verified
                password: null, // No password for OAuth users
              },
            });
            
            // Update the user object with database ID
            user.id = newUser.id;
            console.log('[NextAuth] New user created:', newUser.email);
          } else {
            // Update user with latest info from Google
            user.id = existingUser.id;
            if (user.image && !existingUser.image) {
              await prisma.user.update({
                where: { email: user.email },
                data: { image: user.image },
              });
            }
          }
        } catch (error) {
          console.error('[NextAuth] Error in Google signup:', error);
          return false;
        }
      }
      
      return true;
    },

    async jwt({ token, user, account }) {
      console.log('[NextAuth] jwt callback:', {
        isNewUser: !!user,
        provider: account?.provider,
        email: token.email,
      });
      
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
      }
      
      if (account) {
        token.provider = account.provider;
      }
      
      return token;
    },

    async session({ session, token }) {
      console.log('[NextAuth] session callback:', {
        email: token.email,
      });
      
      if (session.user) {
        session.user.email = token.email;
        session.user.name = token.name;
        (session.user as any).id = token.id;
      }
      
      return session;
    },

    async redirect({ url, baseUrl }) {
      // Redirect to dashboard after signin
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      if (new URL(url).origin === baseUrl) return url;
      return `${baseUrl}/dashboard`;
    },
  },

  // Debug mode
  debug: process.env.NODE_ENV === 'development',
};

export default NextAuth(authOptions);
