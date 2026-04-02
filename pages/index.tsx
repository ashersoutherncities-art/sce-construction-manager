import Head from 'next/head';
import Navbar from '@/components/landing/Navbar';
import Hero from '@/components/landing/Hero';
import Button from '@/components/landing/Button';
import FeatureCard from '@/components/landing/FeatureCard';
import BenefitItem from '@/components/landing/BenefitItem';
import Footer from '@/components/landing/Footer';

/* ── SVG Icons ── */
const IconClipboard = () => (
  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
  </svg>
);
const IconUsers = () => (
  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
  </svg>
);
const IconCurrency = () => (
  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
const IconCamera = () => (
  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
  </svg>
);
const IconChart = () => (
  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
  </svg>
);
const IconDocument = () => (
  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
  </svg>
);

export default function Home() {
  return (
    <>
      <Head>
        <title>SCE Construction Manager — Project Management for GCs</title>
        <meta
          name="description"
          content="Track projects, manage subs, control budgets, and keep every stakeholder in the loop. Built by a general contractor, for general contractors."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-white">
        <Navbar />
        <Hero />

        {/* ── Value Proposition ── */}
        <section id="benefits" className="py-20 md:py-28 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              {/* Left column — copy */}
              <div>
                <span className="text-sce-orange font-semibold text-sm uppercase tracking-wider">
                  Why Construction Manager
                </span>
                <h2 className="text-3xl sm:text-4xl font-bold text-sce-navy mt-3 mb-8 leading-tight">
                  Stop juggling spreadsheets.{' '}
                  <span className="text-sce-orange">Start running jobs.</span>
                </h2>
                <div className="space-y-8">
                  <BenefitItem
                    number="1"
                    title="One Dashboard for Every Job"
                    description="See all active projects, budgets, and timelines at a glance. No more tab-switching between spreadsheets and email."
                  />
                  <BenefitItem
                    number="2"
                    title="Subcontractor Management Built In"
                    description="Track your subs, their bids, payment status, and performance — all tied directly to the project they're working on."
                  />
                  <BenefitItem
                    number="3"
                    title="Real-Time Budget Tracking"
                    description="Know exactly where every dollar goes. Compare estimated vs. actual costs and catch overruns before they become problems."
                  />
                  <BenefitItem
                    number="4"
                    title="Photo Documentation & Reports"
                    description="Upload progress photos, generate PDF reports, and keep an airtight paper trail for every job from start to finish."
                  />
                </div>
              </div>

              {/* Right column — illustration card */}
              <div className="relative">
                <div className="bg-gradient-to-br from-sce-navy to-[#1a3068] rounded-3xl p-8 md:p-10 text-white shadow-2xl">
                  <div className="space-y-5">
                    {/* Mini dashboard mockup */}
                    <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-white/80">Active Projects</span>
                        <span className="text-2xl font-bold text-sce-orange">8</span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-2">
                        <div className="bg-sce-orange h-2 rounded-full" style={{ width: '72%' }} />
                      </div>
                      <p className="text-xs text-white/50 mt-1">72% on schedule</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                        <p className="text-xs text-white/60 mb-1">Total Budget</p>
                        <p className="text-lg font-bold">$1.2M</p>
                      </div>
                      <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                        <p className="text-xs text-white/60 mb-1">Active Subs</p>
                        <p className="text-lg font-bold">14</p>
                      </div>
                    </div>

                    <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                      <p className="text-xs text-white/60 mb-2">Recent Activity</p>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <div className="w-2 h-2 bg-green-400 rounded-full" />
                          <span className="text-white/80">1234 Oak St — Framing complete</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <div className="w-2 h-2 bg-sce-orange rounded-full" />
                          <span className="text-white/80">567 Elm Ave — Electrical in progress</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <div className="w-2 h-2 bg-blue-400 rounded-full" />
                          <span className="text-white/80">890 Pine Dr — Permits approved</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Decorative dot */}
                <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-sce-orange/10 rounded-full blur-2xl" />
              </div>
            </div>
          </div>
        </section>

        {/* ── Features Grid ── */}
        <section className="py-20 md:py-28 px-4 sm:px-6 lg:px-8 bg-sce-light">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-14">
              <span className="text-sce-orange font-semibold text-sm uppercase tracking-wider">
                Features
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-sce-navy mt-3 mb-4">
                Everything You Need to Run Your Jobs
              </h2>
              <p className="text-sce-gray max-w-2xl mx-auto">
                Purpose-built tools that handle the real problems general contractors
                face every day on the job.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              <FeatureCard
                icon={<IconClipboard />}
                title="Project Tracking"
                description="Create and manage projects with timelines, milestones, and status updates. See what's on track and what needs attention."
              />
              <FeatureCard
                icon={<IconUsers />}
                title="Sub Management"
                description="Manage subcontractor assignments, bids, and payment schedules. Rate performance and build your trusted network."
              />
              <FeatureCard
                icon={<IconCurrency />}
                title="Budget Control"
                description="Set budgets, track spending by category, and compare estimated vs. actual costs in real time across every project."
              />
              <FeatureCard
                icon={<IconCamera />}
                title="Photo Documentation"
                description="Upload job-site photos tied to specific projects and phases. Build a visual timeline of every project's progress."
              />
              <FeatureCard
                icon={<IconChart />}
                title="Reports & Analytics"
                description="Generate professional PDF reports, track KPIs, and get a bird's-eye view of your entire operation."
              />
              <FeatureCard
                icon={<IconDocument />}
                title="Document Management"
                description="Store contracts, permits, change orders, and lien waivers all in one place — searchable and organized by project."
              />
            </div>
          </div>
        </section>

        {/* ── Final CTA ── */}
        <section className="py-20 md:py-28 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-sce-navy to-[#1a3068] relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-sce-orange/5 rounded-full blur-3xl" />
          </div>
          <div className="max-w-3xl mx-auto text-center relative z-10">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
              Ready to Take Control of Your Projects?
            </h2>
            <p className="text-white/70 text-lg mb-10 max-w-xl mx-auto">
              Join general contractors who are ditching spreadsheets and running
              their businesses from one powerful dashboard.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button href="/signup" variant="primary" size="lg">
                Get Started Free
              </Button>
              <Button href="/login" variant="outline" size="lg">
                Log In →
              </Button>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
}
