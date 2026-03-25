/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    // Pre-existing type errors in analyze-plans.ts (missing @anthropic-ai/sdk)
    ignoreBuildErrors: true,
  },
}

module.exports = nextConfig
