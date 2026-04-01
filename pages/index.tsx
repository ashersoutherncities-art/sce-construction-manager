import Head from 'next/head';
import Link from 'next/link';
import { signIn } from 'next-auth/react';

export default function Home() {
  return (
    <>
      <Head>
        <title>SCE Construction Manager | Project Management Software</title>
        <meta name="description" content="Professional construction project management software for Southern Cities Enterprises. Track projects, manage subcontractors, and streamline budgets." />
      </Head>

      <div className="min-h-screen bg-white">
        {/* Header */}
        <header className="bg-sce-navy text-white py-3 md:py-4 px-4 md:px-6 shadow-lg sticky top-0 z-50">
          <div className="container mx-auto flex justify-between items-center">
            <Link href="/" className="hover:opacity-80 transition-opacity flex-shrink-0">
              <img 
                src="/logos/sc-construction-logo.png" 
                alt="Southern Cities Construction" 
                className="h-12 md:h-16 w-auto"
              />
            </Link>
            <nav className="flex gap-4 md:gap-8 text-sm md:text-base items-center">
              <Link href="/features" className="text-white hover:text-sce-orange transition-colors whitespace-nowrap">
                Features
              </Link>
              <Link
                href="/login"
                className="bg-sce-orange text-white px-4 md:px-6 py-2 md:py-2.5 rounded-lg hover:bg-orange-600 transition-colors font-semibold whitespace-nowrap"
              >
                Login
              </Link>
            </nav>
          </div>
        </header>

        {/* Hero Section */}
        <section className="bg-gradient-to-br from-sce-navy via-blue-900 to-sce-navy text-white py-16 md:py-24 px-4 md:px-6 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-96 h-96 bg-sce-orange rounded-full filter blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-400 rounded-full filter blur-3xl"></div>
          </div>
          
          <div className="container mx-auto max-w-4xl relative z-10">
            <div className="text-center mb-12">
              <span className="inline-block bg-sce-orange text-sce-navy px-4 py-2 rounded-full text-sm font-semibold mb-4">
                Construction Management Platform
              </span>
              <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                Manage Your Construction Projects with Confidence
              </h1>
              <p className="text-lg md:text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                From intake to completion, track every project, manage subcontractors, and stay within budget. Built for construction professionals.
              </p>
              
              <div className="flex flex-col sm:flex-row justify-center gap-4 md:gap-6">
                <button
                  onClick={() => signIn('google')}
                  className="bg-sce-orange text-white px-8 py-4 rounded-lg font-semibold hover:bg-orange-600 transition-all text-base md:text-lg"
                >
                  Sign In with Google
                </button>
                <Link
                  href="/signup"
                  className="border-2 border-sce-orange text-sce-orange hover:bg-sce-orange hover:text-white px-8 py-4 rounded-lg font-semibold transition-all text-center text-base md:text-lg"
                >
                  Create Free Account
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-16 md:py-24 px-4 md:px-6 bg-gray-50">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Powerful Features Built for You</h2>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto">Everything you need to manage construction projects efficiently</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
                <div className="h-12 w-12 bg-sce-orange rounded-lg flex items-center justify-center mb-6">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Project Analytics</h3>
                <p className="text-gray-600">Get detailed insights into project progress, timelines, and performance metrics in real-time</p>
              </div>

              {/* Feature 2 */}
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
                <div className="h-12 w-12 bg-sce-orange rounded-lg flex items-center justify-center mb-6">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.856-1.487M15 10a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Subcontractor Management</h3>
                <p className="text-gray-600">Organize, schedule, and communicate with all your subcontractors in one centralized platform</p>
              </div>

              {/* Feature 3 */}
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
                <div className="h-12 w-12 bg-sce-orange rounded-lg flex items-center justify-center mb-6">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Budget Tracking</h3>
                <p className="text-gray-600">Monitor spending, track invoices, and manage payments with complete financial visibility</p>
              </div>

              {/* Feature 4 */}
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
                <div className="h-12 w-12 bg-sce-orange rounded-lg flex items-center justify-center mb-6">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Real-Time Updates</h3>
                <p className="text-gray-600">Stay informed with instant notifications on project changes, schedules, and important milestones</p>
              </div>

              {/* Feature 5 */}
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
                <div className="h-12 w-12 bg-sce-orange rounded-lg flex items-center justify-center mb-6">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Customizable Workflows</h3>
                <p className="text-gray-600">Tailor the platform to match your specific processes and business requirements</p>
              </div>

              {/* Feature 6 */}
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
                <div className="h-12 w-12 bg-sce-orange rounded-lg flex items-center justify-center mb-6">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Secure & Reliable</h3>
                <p className="text-gray-600">Enterprise-grade security to protect your data and keep your projects running smoothly</p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-16 md:py-24 px-4 md:px-6">
          <div className="container mx-auto max-w-5xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
              <p className="text-gray-600 text-lg">Get started in minutes with our simple onboarding process</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="relative">
                <div className="absolute -left-4 md:left-1/2 top-0 md:top-8 w-8 h-8 md:w-12 md:h-12 bg-sce-orange rounded-full flex items-center justify-center text-white font-bold text-sm md:text-base">1</div>
                <div className="md:ml-12 pt-12 md:pt-0">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Create Account</h3>
                  <p className="text-gray-600">Sign up in seconds with your Google account or email</p>
                </div>
              </div>

              <div className="relative">
                <div className="absolute -left-4 md:left-1/2 top-0 md:top-8 w-8 h-8 md:w-12 md:h-12 bg-sce-orange rounded-full flex items-center justify-center text-white font-bold text-sm md:text-base">2</div>
                <div className="md:ml-12 pt-12 md:pt-0">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Add Your Projects</h3>
                  <p className="text-gray-600">Input your project details and set up your team</p>
                </div>
              </div>

              <div className="relative">
                <div className="absolute -left-4 md:left-1/2 top-0 md:top-8 w-8 h-8 md:w-12 md:h-12 bg-sce-orange rounded-full flex items-center justify-center text-white font-bold text-sm md:text-base">3</div>
                <div className="md:ml-12 pt-12 md:pt-0">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Start Managing</h3>
                  <p className="text-gray-600">Track progress and manage your projects efficiently</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="bg-sce-navy text-white py-16 md:py-20 px-4 md:px-6">
          <div className="container mx-auto max-w-4xl">
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-4xl md:text-5xl font-bold text-sce-orange mb-2">8+</div>
                <p className="text-lg text-blue-100">Active Construction Projects</p>
              </div>
              <div>
                <div className="text-4xl md:text-5xl font-bold text-sce-orange mb-2">50+</div>
                <p className="text-lg text-blue-100">Professional Team Members</p>
              </div>
              <div>
                <div className="text-4xl md:text-5xl font-bold text-sce-orange mb-2">100%</div>
                <p className="text-lg text-blue-100">Customer Satisfaction Rate</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 md:py-24 px-4 md:px-6 bg-gray-50">
          <div className="container mx-auto max-w-2xl text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Ready to Streamline Your Projects?</h2>
            <p className="text-lg text-gray-600 mb-8">Join construction professionals who are already using our platform</p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4 md:gap-6">
              <button
                onClick={() => signIn('google')}
                className="bg-sce-orange text-white px-8 py-4 rounded-lg font-semibold hover:bg-orange-600 transition-all text-base md:text-lg"
              >
                Get Started Free
              </button>
              <Link
                href="/features"
                className="border-2 border-sce-orange text-sce-orange hover:bg-sce-orange hover:text-white px-8 py-4 rounded-lg font-semibold transition-all text-center text-base md:text-lg"
              >
                Learn More
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-sce-navy text-white py-8 px-4 md:px-6">
          <div className="container mx-auto">
            <div className="grid md:grid-cols-3 gap-8 mb-8 pb-8 border-b border-blue-700">
              <div>
                <h4 className="text-lg font-bold mb-4">Product</h4>
                <ul className="space-y-2">
                  <li><Link href="/features" className="text-blue-100 hover:text-sce-orange transition-colors">Features</Link></li>
                  <li><Link href="/login" className="text-blue-100 hover:text-sce-orange transition-colors">Login</Link></li>
                  <li><Link href="/signup" className="text-blue-100 hover:text-sce-orange transition-colors">Sign Up</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="text-lg font-bold mb-4">Company</h4>
                <ul className="space-y-2">
                  <li><a href="#" className="text-blue-100 hover:text-sce-orange transition-colors">About Us</a></li>
                  <li><a href="#" className="text-blue-100 hover:text-sce-orange transition-colors">Contact</a></li>
                  <li><a href="#" className="text-blue-100 hover:text-sce-orange transition-colors">Blog</a></li>
                </ul>
              </div>
              <div>
                <h4 className="text-lg font-bold mb-4">Legal</h4>
                <ul className="space-y-2">
                  <li><a href="#" className="text-blue-100 hover:text-sce-orange transition-colors">Privacy Policy</a></li>
                  <li><a href="#" className="text-blue-100 hover:text-sce-orange transition-colors">Terms of Service</a></li>
                  <li><a href="#" className="text-blue-100 hover:text-sce-orange transition-colors">Support</a></li>
                </ul>
              </div>
            </div>
            <div className="text-center text-blue-100">
              <p>&copy; 2026 Southern Cities Construction. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
