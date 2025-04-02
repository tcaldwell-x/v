/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['pbs.twimg.com'], // Allow images from X/Twitter
  },
}

module.exports = nextConfig 