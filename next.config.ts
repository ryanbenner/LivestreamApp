/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        hostname: "utfs.io",
        protocol: "https",
      },
    ],
  },
  webpack: (config: { module: { rules: { test: RegExp; include: RegExp; type: string; }[]; }; }) => {
    config.module.rules.push({
      test: /\.mjs$/,
      include: /node_modules/,
      type: "javascript/auto",
    });

    return config;
  },
};

module.exports = nextConfig;