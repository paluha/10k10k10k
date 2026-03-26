import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      // Clean ad links → quiz page (URL stays clean, no redirect visible)
      { source: '/go', destination: '/r/s' },
      { source: '/start', destination: '/r/s' },
      { source: '/q', destination: '/r/s' },
      // English versions
      { source: '/get', destination: '/r/s' },
    ];
  },
};

export default nextConfig;
