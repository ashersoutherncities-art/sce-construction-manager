import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { SessionProvider } from 'next-auth/react'
import { ToastProvider } from '@/components/Toast'
import React from 'react'

// Error boundary to catch SessionProvider failures
class AuthErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      // Render without auth if SessionProvider fails
      return this.props.children;
    }
    return this.props.children;
  }
}

export default function App({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  return (
    <AuthErrorBoundary>
      <SessionProvider session={session || null} refetchInterval={30} refetchOnWindowFocus={true} refetchOnReconnect={true}>
        <ToastProvider>
          <Component {...pageProps} />
        </ToastProvider>
      </SessionProvider>
    </AuthErrorBoundary>
  )
}
