import { getServerSession } from 'next-auth/next';
import { authOptions } from './[...nextauth]';
import { NextRequest, NextResponse } from 'next/server';

export default async function handler(req: any, res: any) {
  try {
    const session = await getServerSession(req, res, authOptions);
    
    return res.status(200).json({
      timestamp: new Date().toISOString(),
      hasSession: !!session,
      session: session ? {
        user: {
          email: session.user?.email,
          name: session.user?.name,
          id: (session.user as any)?.id,
          provider: (session.user as any)?.provider,
        },
        expires: session.expires,
      } : null,
      cookies: {
        sessionToken: req.cookies['next-auth.session-token'] ? 'SET' : 'MISSING',
      },
      message: session ? 'SESSION EXISTS' : 'NO SESSION - This is why you get redirected to login',
    });
  } catch (e) {
    return res.status(500).json({
      error: String(e),
      stack: e instanceof Error ? e.stack : 'unknown',
    });
  }
}
