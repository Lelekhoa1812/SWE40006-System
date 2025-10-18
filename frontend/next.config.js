/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  webpack: (config) => {
    config.module.rules.push({
      test: /\.(ts|tsx)$/,
      exclude: /vitest\.config\.ts$/,
    });
    return config;
  },
};

module.exports = nextConfig;
