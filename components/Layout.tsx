import Link from 'next/link';
import { useRouter } from 'next/router';
import { ReactNode } from 'react';
import { useSession, signOut } from 'next-auth/react';

interface LayoutProps {
  children: ReactNode;
  title?: string;
}

export default function Layout({ children, title }: LayoutProps) {
  const router = useRouter();
  const { data: session } = useSession();

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/intake', label: 'New Project' },
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/analyze', label: 'Photo Analysis' },
    { href: '/vendors', label: 'Vendors' },
    { href: '/admin/scraper-dashboard', label: 'FB Scraper' },
  ];

  return (
    <div className="min-h-screen bg-sce-light">
      {/* Header */}
      <header className="bg-sce-navy text-white py-2 px-6 shadow-lg sticky top-0 z-50">
        <div className="container mx-auto">
          <div className="flex justify-between items-center">
            <Link href="/" className="hover:opacity-90 transition-opacity">
              <img 
                src="/sc-logo-white.svg" 
                alt="Southern Cities Construction" 
                className="h-12 w-auto"
              />
            </Link>

            <div className="flex items-center gap-6">
              <nav className="hidden md:flex gap-6">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`hover:text-sce-orange transition-colors ${
                      router.pathname === link.href ? 'text-sce-orange font-semibold' : ''
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>

              {/* User Menu */}
              {session?.user ? (
                <div className="hidden md:flex items-center gap-3">
                  <Link href="/profile" className="flex items-center gap-2 hover:text-sce-orange transition-colors">
                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-xs font-bold text-blue-600">
                      A
                    </div>
                    <span className="text-sm">{session.user.name?.split(' ')[0]}</span>
                  </Link>
                  <button
                    onClick={() => signOut({ callbackUrl: '/login' })}
                    className="text-sm text-gray-300 hover:text-white transition-colors"
                    title="Sign out"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                  </button>
                </div>
              ) : (
                <Link href="/login" className="hidden md:block text-sm hover:text-sce-orange transition-colors">
                  Sign In
                </Link>
              )}
            </div>

            {/* Mobile menu button */}
            <button className="md:hidden">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Page Title */}
      {title && (
        <div className="bg-black text-white py-12 px-6">
          <div className="container mx-auto">
            <h1 className="text-4xl font-serif font-bold">{title}</h1>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="container mx-auto py-8 px-6">{children}</main>

      {/* Footer */}
      <footer className="bg-black text-white py-8 px-6 mt-16">
        <div className="container mx-auto text-center">
          <p className="text-sce-gray">
            © 2024 Southern Cities Enterprises. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
