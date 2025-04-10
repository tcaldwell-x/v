/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['pbs.twimg.com'], // Allow images from X/Twitter
  },
  // Ensure proper handling of trailing slashes
  trailingSlash: false,
  // Enable static optimization where possible
  swcMinify: true,
  // Ensure proper handling of basePath if you're using a custom domain
  basePath: '',
}

module.exports = nextConfig 