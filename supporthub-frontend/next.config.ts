/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/a/**',
      },
    ],
    domains: ['res.cloudinary.com'],
  },
  experimental: {
  },
};

module.exports = nextConfig;
