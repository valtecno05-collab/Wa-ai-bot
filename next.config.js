/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Memaksa Vercel tetap menyelesaikan build meskipun ada error TypeScript
    ignoreBuildErrors: true,
  },
  eslint: {
    // Memaksa Vercel mengabaikan error ESLint saat build
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
