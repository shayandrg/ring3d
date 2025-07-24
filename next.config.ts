/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  basePath: '/ring3d',
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
