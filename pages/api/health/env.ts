// Health check endpoint that shows env var status
export default function handler(req: any, res: any) {
  return res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      NEXTAUTH_URL: process.env.NEXTAUTH_URL || '(not set)',
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? '(set - hidden)' : '(NOT SET)',
      GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ? '(set - hidden)' : '(NOT SET)',
      GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ? '(set - hidden)' : '(NOT SET)',
    },
  });
}
