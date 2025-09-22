/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@story-doctor/core', '@story-doctor/ui'],
}

module.exports = nextConfig