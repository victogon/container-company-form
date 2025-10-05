import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configuración para manejar archivos grandes
  serverRuntimeConfig: {
    maxFileSize: 50 * 1024 * 1024, // 50MB
  },
  publicRuntimeConfig: {
    maxFileSize: 50 * 1024 * 1024, // 50MB
  },
  images: {
    domains: ['res.cloudinary.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
