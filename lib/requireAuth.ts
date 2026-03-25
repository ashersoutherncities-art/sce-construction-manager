import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

/**
 * Hook to require authentication on a page.
 * Redirects to /login if not authenticated.
 * Returns { session, status } for use in the component.
 */
export function useRequireAuth() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push(`/login?callbackUrl=${encodeURIComponent(router.asPath)}`);
    }
  }, [status, router]);

  return { session, status, isLoading: status === 'loading' };
}
