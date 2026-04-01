import Head from 'next/head';
import Link from 'next/link';
import { signIn } from 'next-auth/react';

export default function Home() {
  return (
    <>
      <Head>
        <title>SCE Construction Manager | Southern Cities Enterprises</title>
        <meta name="description" content="Construction project management for Southern Cities Enterprises" />
      </Head>

      <div className="min-h-screen bg-sce-light">
        {/* Header */}
        <header className="bg-sce-navy text-white py-2 md:py-3 px-4 md:px-6 shadow-lg">
          <div className="container mx-auto flex justify-between items-center">
            <Link href="/" className="hover:opacity-80 transition-opacity flex-shrink-0">
              <img 
                src="/logos/sc-construction-logo.png" 
                alt="Southern Cities Construction" 
                className="h-12 md:h-20 w-auto"
              />
            </Link>
            <nav className="flex gap-3 md:gap-6 text-sm md:text-base">
              <Link href="/features" className="text-white hover:text-sce-orange transition-colors whitespace-nowrap">
                Features
              </Link>
              <Link href="/login" className="text-white hover:text-sce-orange transition-colors whitespace-nowrap">
                Login
              </Link>
            </nav>
          </div>
        </header>

        {/* Hero Section */}
        <section className="bg-black text-white py-12 md:py-20 px-4 md:px-6">
          <div className="container mx-auto text-center max-w-2xl">
            <h2 className="text-3xl md:text-5xl font-serif font-bold mb-4">
              Streamline Your Construction Projects
            </h2>
            <p className="text-base md:text-xl text-sce-orange mb-8">
              From intake to completion, manage everything in one place
            </p>
            <div className="flex flex-col md:flex-row justify-center gap-4 md:gap-6">
              <button
                onClick={() => signIn('google')}
                className="bg-sce-orange text-white px-6 md:px-8 py-3 md:py-4 rounded-full font-semibold hover:bg-white hover:text-sce-navy transition-all text-base md:text-lg whitespace-nowrap"
              >
                Sign In with Google
              </button>
              <Link
                href="/login"
                className="border-2 border-sce-orange text-white px-6 md:px-8 py-3 md:py-4 rounded-full font-semibold hover:bg-sce-orange transition-all text-center"
              >
                Or use Login Page
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
