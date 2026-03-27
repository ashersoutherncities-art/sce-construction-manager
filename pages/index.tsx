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
        <header className="bg-sce-navy text-white py-3 px-6 shadow-lg">
          <div className="container mx-auto flex justify-between items-center">
            <Link href="/" className="hover:opacity-80 transition-opacity">
              <img 
                src="/logos/sc-logo-horizontal.svg" 
                alt="Southern Cities Enterprises" 
                className="h-16 w-auto"
              />
            </Link>
            <nav className="flex gap-6">
              <Link href="/features" className="text-white hover:text-sce-orange transition-colors">
                Features
              </Link>
              <Link href="/login" className="text-white hover:text-sce-orange transition-colors">
                Login
              </Link>
            </nav>
          </div>
        </header>

        {/* Hero Section */}
        <section className="bg-black text-white py-20 px-6">
          <div className="container mx-auto text-center">
            <h2 className="text-5xl font-serif font-bold mb-4">
              Streamline Your Construction Projects
            </h2>
            <p className="text-xl text-sce-orange mb-8">
              From intake to completion, manage everything in one place
            </p>
            <div className="flex justify-center gap-4 flex-wrap">
              <button
                onClick={() => signIn('google')}
                className="bg-sce-orange text-white px-8 py-4 rounded-full font-semibold hover:bg-white hover:text-sce-navy transition-all text-lg"
              >
                Sign In with Google
              </button>
              <Link
                href="/login"
                className="border-2 border-sce-orange text-white px-8 py-4 rounded-full font-semibold hover:bg-sce-orange transition-all"
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
