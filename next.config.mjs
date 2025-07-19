/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  experimental: {
    esmExternals: 'loose',
  },
}

export default nextConfig

// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   experimental: {
//     esmExternals: 'loose',
//   },
// };

// module.exports = nextConfig;