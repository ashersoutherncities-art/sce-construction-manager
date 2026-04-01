export { default } from 'next-auth/middleware';

export const config = {
  matcher: [
    // Protect all routes except public ones
    // IMPORTANT: Exclude all /api/* routes - they handle auth themselves via getServerSession
    '/((?!login|api|_next/static|_next/image|logos|favicon.ico|features|plans|intake|profile|vendors|test-autocomplete|$).*)',
  ],
};
