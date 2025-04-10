/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['pbs.twimg.com'], // Allow images from X/Twitter
  },
  // Basic configuration only
  output: 'standalone',
  // Disable compression
  compress: false
}

module.exports = nextConfig 