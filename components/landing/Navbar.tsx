import Link from 'next/link';
import { useState } from 'react';
import Button from './Button';

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="bg-sce-navy sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <img
              src="/sc-logo-white.svg"
              alt="Southern Cities Construction"
              className="h-10 md:h-14 w-auto"
            />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="/features"
              className="text-white/80 hover:text-white transition-colors text-sm font-medium"
            >
              Features
            </Link>
            <Link
              href="#benefits"
              className="text-white/80 hover:text-white transition-colors text-sm font-medium"
            >
              Benefits
            </Link>
            <Button href="/login" variant="ghost" size="sm">
              Log In
            </Button>
            <Button href="/signup" variant="primary" size="sm">
              Get Started Free
            </Button>
          </nav>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden text-white p-2"
            aria-label="Toggle menu"
          >
            {mobileOpen ? (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <div className="md:hidden bg-sce-navy border-t border-white/10 px-4 pb-6 pt-2 space-y-3">
          <Link
            href="/features"
            className="block text-white/80 hover:text-white py-2 text-sm font-medium"
            onClick={() => setMobileOpen(false)}
          >
            Features
          </Link>
          <Link
            href="#benefits"
            className="block text-white/80 hover:text-white py-2 text-sm font-medium"
            onClick={() => setMobileOpen(false)}
          >
            Benefits
          </Link>
          <div className="pt-3 space-y-2">
            <Button href="/login" variant="outline" size="sm" fullWidth>
              Log In
            </Button>
            <Button href="/signup" variant="primary" size="sm" fullWidth>
              Get Started Free
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
