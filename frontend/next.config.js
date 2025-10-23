/** @type {import('next').NextConfig} */
const nextConfig = {
  // Remove static export for Vercel deployment
  images: {
    unoptimized: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
