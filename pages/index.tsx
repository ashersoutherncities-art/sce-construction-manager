import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';

export default function Home() {
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
            </div>          </div>
        </section>

        {/* Features Grid */}
        <section className="py-16 px-6">
          <div className="container mx-auto">
            <h3 className="text-3xl font-serif font-bold text-center mb-12">System Features</h3>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow"
                >
                  <div className="text-4xl mb-4">{feature.icon}</div>
                  <h4 className="text-xl font-serif font-bold mb-2 text-sce-navy">
                    {feature.title}
                  </h4>
                  <p className="text-sce-gray mb-4">{feature.description}</p>
                  <Link
                    href={feature.link}
                    className="text-sce-orange font-semibold hover:underline"
                  >
                    Learn more →
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="bg-sce-navy text-white py-16 px-6">
          <div className="container mx-auto">
            <div className="grid md:grid-cols-4 gap-8 text-center">
              {stats.map((stat, idx) => (
                <div key={idx}>
                  <div className="text-5xl font-bold text-sce-orange mb-2">{stat.value}</div>
                  <div className="text-lg">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-black text-white py-8 px-6">
          <div className="container mx-auto text-center">
            <p className="text-sce-gray">
              © 2024 Southern Cities Enterprises. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </>
  );
}

const features = [
  {
    icon: '📋',
    title: 'Project Intake',
    description: 'Capture client info, property details, and requirements in one streamlined form.',
    link: '/intake',
  },
  {
    icon: '🤖',
    title: 'AI Photo Analysis',
    description: 'Upload property photos and get AI-generated scope of work with ARV analysis.',
    link: '/analyze',
  },
  {
    icon: '💰',
    title: 'Cost Estimator',
    description: 'Automatic line-item cost estimates with labor, materials, and timeline.',
    link: '/estimate',
  },
  {
    icon: '📄',
    title: 'Bid Generation',
    description: 'Professional bid sheets with branded cover letters, ready to send.',
    link: '/bids',
  },
  {
    icon: '👷',
    title: 'Vendor Recommendations',
    description: 'Smart vendor matching based on trade, location, and reliability scores.',
    link: '/vendors',
  },
  {
    icon: '📊',
    title: 'Project Dashboard',
    description: 'Track all active jobs, status updates, and project history in one place.',
    link: '/dashboard',
  },
];

const stats = [
  { value: '80%', label: 'Time Saved' },
  { value: '2-3hrs', label: 'Per Project' },
  { value: '8+', label: 'Jobs Managed' },
  { value: '100%', label: 'Automated' },
];
