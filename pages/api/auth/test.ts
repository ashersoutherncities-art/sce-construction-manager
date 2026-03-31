import { getSession } from 'next-auth/react';
import { getServerSession } from 'next-auth';
import { authOptions } from './[...nextauth]';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const timestamp = new Date().toISOString();
  
  try {
    // Get server-side session (more reliable than client-side)
    const session = await getServerSession(req, res, authOptions);
    
    console.log(`[${timestamp}] [TestEndpoint] Session check:`, {
      hasSession: !!session,
      sessionEmail: session?.user?.email,
    });

    // Also check the raw token if we can access it
    const token = (req as any).cookies?.['next-auth.session-token'] || (req as any).headers?.authorization;

    res.status(200).json({
      timestamp,
      authenticated: !!session,
      session: session || null,
      user: session?.user || null,
      debugInfo: {
        hasSessionToken: !!(req as any).cookies?.['next-auth.session-token'],
        hasBearerToken: !!(req as any).headers?.authorization,
        nodeEnv: process.env.NODE_ENV,
        nextauthUrl: process.env.NEXTAUTH_URL,
        nextauthSecretSet: !!process.env.NEXTAUTH_SECRET,
      },
      message: session 
        ? 'User is authenticated!'
        : 'User is NOT authenticated. Check session token in cookies.',
    });
  } catch (error) {
    console.error(`[${timestamp}] [TestEndpoint] Error:`, error);
    res.status(500).json({
      timestamp,
      error: (error as any).message,
      stack: (error as any).stack,
    });
  }
}
