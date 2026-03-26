import Head from 'next/head';
import Link from 'next/link';
import { useSession, signIn } from 'next-auth/react';

export default function Home() {
  const { data: session, status } = useSession();

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
            {status === 'authenticated' && (
              <div className="text-right">
                <p className="text-sm">Welcome, {session?.user?.name}</p>
              </div>
            )}
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
              {status === 'loading' && (
                <p className="text-gray-400">Loading...</p>
              )}
              {status === 'authenticated' ? (
                <>
                  <Link
                    href="/intake"
                    className="bg-sce-orange text-white px-8 py-4 rounded-full font-semibold hover:bg-white hover:text-sce-navy transition-all"
                  >
                    New Project Intake
                  </Link>
                  <Link
                    href="/plans"
                    className="bg-sce-navy text-white px-8 py-4 rounded-full font-semibold hover:bg-sce-orange transition-all"
                  >
                    Analyze Plans/Blueprints
                  </Link>
                  <Link
                    href="/dashboard"
                    className="border-2 border-sce-orange text-white px-8 py-4 rounded-full font-semibold hover:bg-sce-orange transition-all"
                  >
                    View Dashboard
                  </Link>
                </>
              ) : (
                <button
                  onClick={() => signIn('google')}
                  className="bg-sce-orange text-white px-8 py-4 rounded-full font-semibold hover:bg-white hover:text-sce-navy transition-all text-lg"
                >
                  Sign In with Google
                </button>
              )}
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
      </div>
    </>
  );
}
