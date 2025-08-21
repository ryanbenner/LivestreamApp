import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      crypto: false, // Don't polyfill 'node:crypto' on the client
    };
    return config;
  },
};

export default nextConfig;