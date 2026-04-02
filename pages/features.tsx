import Head from 'next/head';
import Link from 'next/link';

export default function Features() {
  return (
    <>
      <Head>
        <title>Features | SCE Construction Manager</title>
        <meta name="description" content="Powerful features for construction project management" />
      </Head>

      <div className="min-h-screen bg-sce-light">
        {/* Header */}
        <header className="bg-sce-navy text-white py-3 px-6 shadow-lg">
          <div className="container mx-auto flex justify-between items-center">
            <Link href="/" className="hover:opacity-80 transition-opacity">
              <img 
                src="/sc-logo-white.svg" 
                alt="Southern Cities Enterprises" 
                className="h-16 w-auto"
              />
            </Link>
            <nav className="flex gap-6">
              <Link href="/" className="text-white hover:text-sce-orange transition-colors">
                Home
              </Link>
              <Link href="/login" className="text-white hover:text-sce-orange transition-colors">
                Login
              </Link>
            </nav>
          </div>
        </header>

        {/* Features Section */}
        <section className="py-20 px-6">
          <div className="container mx-auto">
            <h2 className="text-5xl font-serif font-bold text-center mb-4 text-sce-navy">
              Key Features
            </h2>
            <p className="text-center text-gray-600 text-lg mb-16 max-w-2xl mx-auto">
              Everything you need to manage construction projects from intake to completion
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
              {/* Feature 1 */}
              <div className="bg-white p-8 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
                <div className="bg-sce-orange rounded-full w-16 h-16 flex items-center justify-center mb-4">
                  <span className="text-white text-2xl font-bold">📋</span>
                </div>
                <h3 className="text-xl font-bold text-sce-navy mb-3">Project Intake</h3>
                <p className="text-gray-600">
                  Quickly capture project details, photos, and specifications in one streamlined form. Get all the information you need in minutes.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="bg-white p-8 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
                <div className="bg-sce-orange rounded-full w-16 h-16 flex items-center justify-center mb-4">
                  <span className="text-white text-2xl font-bold">🤖</span>
                </div>
                <h3 className="text-xl font-bold text-sce-navy mb-3">AI Analysis</h3>
                <p className="text-gray-600">
                  Get instant cost estimates and project analysis powered by AI technology. Make data-driven decisions faster than ever.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="bg-white p-8 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
                <div className="bg-sce-orange rounded-full w-16 h-16 flex items-center justify-center mb-4">
                  <span className="text-white text-2xl font-bold">📊</span>
                </div>
                <h3 className="text-xl font-bold text-sce-navy mb-3">Dashboard</h3>
                <p className="text-gray-600">
                  View all your projects at a glance with real-time status tracking and metrics. Stay on top of every project.
                </p>
              </div>
            </div>

            {/* Additional Features */}
            <div className="bg-sce-navy text-white rounded-lg p-12 mb-16">
              <h3 className="text-3xl font-serif font-bold mb-8">Why Choose Our Platform?</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex gap-4">
                  <div className="text-sce-orange text-3xl">✓</div>
                  <div>
                    <h4 className="font-bold text-lg mb-2">Real-Time Collaboration</h4>
                    <p>Work with your team in real-time, share updates instantly</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="text-sce-orange text-3xl">✓</div>
                  <div>
                    <h4 className="font-bold text-lg mb-2">Mobile Friendly</h4>
                    <p>Access your projects anywhere, anytime from any device</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="text-sce-orange text-3xl">✓</div>
                  <div>
                    <h4 className="font-bold text-lg mb-2">Advanced Security</h4>
                    <p>Your data is protected with enterprise-grade security</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="text-sce-orange text-3xl">✓</div>
                  <div>
                    <h4 className="font-bold text-lg mb-2">24/7 Support</h4>
                    <p>Get help whenever you need it with our dedicated support team</p>
                  </div>
                </div>
              </div>
            </div>

            {/* CTA Section */}
            <div className="text-center">
              <p className="text-gray-600 text-lg mb-6">Ready to streamline your construction projects?</p>
              <Link
                href="/login"
                className="inline-block bg-sce-orange text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-sce-navy hover:text-sce-orange transition-all border-2 border-sce-orange"
              >
                Get Started Now
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-sce-navy text-white py-8 px-6 mt-20">
          <div className="container mx-auto text-center">
            <p>&copy; 2026 Southern Cities Enterprises. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </>
  );
}
