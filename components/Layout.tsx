import Link from 'next/link';
import { useRouter } from 'next/router';
import { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
  title?: string;
}

export default function Layout({ children, title }: LayoutProps) {
  const router = useRouter();

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/intake', label: 'New Project' },
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/analyze', label: 'Photo Analysis' },
    { href: '/vendors', label: 'Vendors' },
  ];

  return (
    <div className="min-h-screen bg-sce-light">
      {/* Header */}
      <header className="bg-sce-navy text-white py-4 px-6 shadow-lg sticky top-0 z-50">
        <div className="container mx-auto">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center gap-3">
              <div className="text-2xl font-serif font-bold">
                Southern Cities Enterprises
              </div>
            </Link>

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
