import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverComponentsExternalPackages: [],
  },
  // Configuración para manejar archivos grandes
  serverRuntimeConfig: {
    maxFileSize: 50 * 1024 * 1024, // 50MB
  },
  publicRuntimeConfig: {
    maxFileSize: 50 * 1024 * 1024, // 50MB
  },
};

export default nextConfig;
