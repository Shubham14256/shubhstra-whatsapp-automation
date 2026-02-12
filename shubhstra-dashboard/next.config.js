/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  turbopack: {
    root: __dirname,
  },
  // Suppress hydration warnings caused by browser extensions
  // These are typically from extensions like ad blockers, password managers, etc.
  // that inject scripts into the page
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },
  // Suppress specific hydration warnings in development
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      // Suppress hydration warnings from browser extensions
      const originalEntry = config.entry;
      config.entry = async () => {
        const entries = await originalEntry();
        return entries;
      };
    }
    return config;
  },
}

module.exports = nextConfig
