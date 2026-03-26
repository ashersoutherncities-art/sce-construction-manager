import Head from 'next/head';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // If already logged in, redirect to dashboard
  useEffect(() => {
    if (session) {
      router.push('/dashboard');
    }
  }, [session, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-sce-light">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>SCE Construction Manager | Southern Cities Enterprises</title>
        <meta name="description" content="Construction project management for Southern Cities Enterprises" />
      </Head>

      <div className="min-h-screen bg-sce-light">
        {/* Header */}
        <header className="bg-sce-navy text-white py-6 px-6 shadow-lg">
          <div className="container mx-auto flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-serif font-bold">Southern Cities Enterprises</h1>
              <p className="text-sce-orange mt-1">Construction Management System</p>
            </div>
            <Link
              href="/login"
              className="bg-sce-orange text-white px-6 py-2.5 rounded-full font-semibold hover:bg-white hover:text-sce-navy transition-all"
            >
              Sign In
            </Link>
          </div>
        </header>

        {/* Hero Section */}
        <section className="bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white py-20 px-6">
          <div className="container mx-auto text-center">
            <h2 className="text-5xl font-serif font-bold mb-4">
              Streamline Your Construction Projects
            </h2>
            <p className="text-xl text-sce-orange mb-8">
              From intake to completion, manage everything in one place
            </p>
            <div className="flex justify-center gap-4 flex-wrap">
              <Link
                href="/login"
                className="bg-sce-orange text-white px-8 py-4 rounded-full font-semibold hover:bg-white hover:text-sce-navy transition-all text-lg"
              >
                Sign In
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 px-6">
          <div className="container mx-auto">
            <h3 className="text-3xl font-serif font-bold text-center mb-12">Key Features</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-8 rounded-lg shadow">
                <h4 className="text-xl font-bold text-sce-navy mb-3">Project Intake</h4>
                <p className="text-gray-600">Quickly capture project details, photos, and specifications in one streamlined form.</p>
              </div>
              <div className="bg-white p-8 rounded-lg shadow">
                <h4 className="text-xl font-bold text-sce-navy mb-3">AI Analysis</h4>
                <p className="text-gray-600">Get instant cost estimates and project analysis powered by AI technology.</p>
              </div>
              <div className="bg-white p-8 rounded-lg shadow">
                <h4 className="text-xl font-bold text-sce-navy mb-3">Dashboard</h4>
                <p className="text-gray-600">View all your projects at a glance with real-time status tracking and metrics.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-black text-white py-8 px-6">
          <div className="container mx-auto text-center">
            <p className="text-gray-400">
              © 2024 Southern Cities Enterprises. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </>
  );
}
