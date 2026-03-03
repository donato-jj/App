/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    optimizePackageImports: ["three", "@react-three/fiber", "@react-three/drei"]
  }
};
module.exports = nextConfig;
