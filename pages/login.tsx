import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';

export default function LoginPage() {
  const { data: session, status } = useSession({ required: false });
  const router = useRouter();
  const callbackUrl = (router.query.callbackUrl as string) || '/dashboard';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Log all session and status changes
  useEffect(() => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [LoginPage] session/status changed:`, {
      status,
      hasSession: !!session,
      sessionEmail: session?.user?.email,
      callbackUrl,
    });
  }, [session, status, callbackUrl]);

  // Redirect when session is established
  useEffect(() => {
    const timestamp = new Date().toISOString();
    if (session) {
      console.log(`[${timestamp}] [LoginPage] Session established, pushing to:`, callbackUrl);
      router.push(callbackUrl);
    }
  }, [session, router, callbackUrl]);

  // Handle email/password form submission
  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        callbackUrl,
        redirect: false,
      });

      if (result?.error) {
        setError('Invalid email or password. Please try again.');
        console.error('[LoginPage] Credentials signin error:', result.error);
      } else if (result?.ok) {
        // Redirect will happen via useEffect above when session updates
        console.log('[LoginPage] Credentials signin successful');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error('[LoginPage] Credentials signin exception:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sce-orange" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col overflow-hidden">
      <Head>
        <title>Sign In | SCE Construction Manager</title>
      </Head>
      {/* Header */}
      <header className="bg-sce-navy text-white py-3 px-6 shadow-lg relative z-10">
        <div className="container mx-auto flex justify-between items-center">
          <Link href="/" className="hover:opacity-80 transition-opacity">
            <img 
              src="/logos/sc-logo-horizontal.svg" 
              alt="Southern Cities Enterprises" 
              className="h-16 w-auto"
            />
          </Link>
          <nav className="flex gap-6">
            <Link href="/" className="text-white hover:text-sce-orange transition-colors">
              Home
            </Link>
            <Link href="/features" className="text-white hover:text-sce-orange transition-colors">
              Features
            </Link>
          </nav>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-sce-navy via-blue-900 to-sce-navy overflow-hidden relative z-0">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            {/* Logo / Brand */}
            <div className="text-center mb-8">
              <div className="mb-6 flex justify-center">
                <img 
                  src="/logos/sc-enterprises-01.svg" 
                  alt="Southern Cities Enterprises" 
                  className="h-20 w-auto"
                />
              </div>
              <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Georgia, serif' }}>
                Sign In
              </h1>
              <p className="text-gray-600 mt-2 text-sm">Construction Manager Portal</p>
            </div>

            {/* Error message */}
            {(router.query.error || error) && (
              <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg text-red-700 text-sm">
                <div className="font-semibold mb-1">❌ Sign In Failed</div>
                <div>
                  {error ? error : (
                    <>
                      {router.query.error === 'OAuthSignin' && 'Error initiating Google sign in. Please check your internet connection and try again.'}
                      {router.query.error === 'OAuthCallback' && 'Google rejected the sign in request. This could mean the credentials are misconfigured or the session expired.'}
                      {router.query.error === 'EmailSignInError' && 'Email sign in is not available. Please use Google sign in instead.'}
                      {router.query.error === 'Callback' && 'An error occurred during the callback. Please try again.'}
                      {router.query.error === 'Default' && 'An unknown error occurred. Please refresh and try again.'}
                      {router.query.error && !['OAuthSignin', 'OAuthCallback', 'EmailSignInError', 'Callback', 'Default'].includes(String(router.query.error)) && `Error: ${router.query.error}`}
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Email/Password Form */}
            <form onSubmit={handleCredentialsSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  disabled={isLoading}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sce-orange focus:border-transparent outline-none transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  disabled={isLoading}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sce-orange focus:border-transparent outline-none transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full px-6 py-3.5 bg-sce-orange text-white font-semibold rounded-xl hover:bg-orange-600 transition-all duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-4 my-6">
              <div className="flex-1 h-px bg-gray-300" />
              <span className="text-xs text-gray-500 font-medium">OR</span>
              <div className="flex-1 h-px bg-gray-300" />
            </div>

            {/* Google OAuth Button */}
            <button
              onClick={() => {
                setIsLoading(true);
                signIn('google', { callbackUrl, redirect: true });
              }}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 px-6 py-3.5 bg-white border-2 border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 group disabled:opacity-50 disabled:cursor-not-allowed"
              title="Sign in with your Google account"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent" />
                  <span className="text-gray-700 font-medium">Signing in...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  <span className="text-gray-700 font-medium group-hover:text-gray-900">
                    Sign in with Google
                  </span>
                </>
              )}
            </button>

            <p className="text-center text-xs text-gray-400 mt-6">
              Access restricted to authorized SCE team members
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
