import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-sce-navy text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Brand */}
          <div>
            <img
              src="/logos/sc-logo-02.png"
              alt="Southern Cities Construction"
              className="h-12 w-auto mb-4"
            />
            <p className="text-white/60 text-sm leading-relaxed max-w-xs">
              Professional construction management software built by a general contractor
              who understands the job.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider mb-4 text-white/40">
              Product
            </h4>
            <ul className="space-y-2.5">
              <li>
                <Link href="/features" className="text-white/60 hover:text-sce-orange transition-colors text-sm">
                  Features
                </Link>
              </li>
              <li>
                <Link href="/signup" className="text-white/60 hover:text-sce-orange transition-colors text-sm">
                  Get Started
                </Link>
              </li>
              <li>
                <Link href="/login" className="text-white/60 hover:text-sce-orange transition-colors text-sm">
                  Log In
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider mb-4 text-white/40">
              Company
            </h4>
            <ul className="space-y-2.5">
              <li>
                <a
                  href="https://southerncitiesinvestors.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/60 hover:text-sce-orange transition-colors text-sm"
                >
                  Southern Cities Enterprises
                </a>
              </li>
              <li>
                <a
                  href="mailto:info@developthesouth.com"
                  className="text-white/60 hover:text-sce-orange transition-colors text-sm"
                >
                  Contact Us
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-white/40 text-sm">
            © {new Date().getFullYear()} Southern Cities Enterprises LLC. All rights reserved.
          </p>
          <p className="text-white/30 text-xs">
            Charlotte, NC
          </p>
        </div>
      </div>
    </footer>
  );
}
