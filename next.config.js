/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    serverComponentsExternalPackages: ['jspdf', 'canvg'],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push({
        canvas: 'commonjs canvas',
      });
    }
    return config;
  },
};

module.exports = nextConfig;