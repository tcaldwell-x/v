/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['pbs.twimg.com'], // Allow images from X/Twitter
  },
  // Ensure proper handling of trailing slashes
  trailingSlash: false,
  // Disable some optimizations that might cause issues
  swcMinify: false,
  // Ensure proper handling of basePath if you're using a custom domain
  basePath: '',
  // Add output configuration
  output: 'standalone',
  // Disable compression
  compress: false,
  // Ensure proper asset handling
  assetPrefix: '',
  // Add webpack configuration
  webpack: (config, { isServer }) => {
    // Add any necessary webpack configurations here
    return config
  }
}

module.exports = nextConfig 