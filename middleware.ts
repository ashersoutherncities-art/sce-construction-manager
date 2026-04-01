export { default } from 'next-auth/middleware';

export const config = {
  matcher: [
    // Protect all routes except public ones
    '/((?!login|api/auth|_next/static|_next/image|logos|favicon.ico|features|$).*)',
  ],
};
