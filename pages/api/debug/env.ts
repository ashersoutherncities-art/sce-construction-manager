// Debug endpoint to check environment variables (REMOVE IN PRODUCTION)
export default function handler(req: any, res: any) {
  // Only allow in development
  if (process.env.NODE_ENV !== 'development') {
    return res.status(403).json({ error: 'Not available in production' });
  }

  return res.status(200).json({
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ? '✓ SET' : '✗ MISSING',
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ? '✓ SET' : '✗ MISSING',
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || '✗ MISSING',
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? '✓ SET' : '✗ MISSING',
    NODE_ENV: process.env.NODE_ENV,
  });
}
