import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // Disable image optimization since we're serving locally
  images: {
    unoptimized: true,
  },
  // Enable runtime configuration
  experimental: {
    appDocumentPreloading: true,
  },
  // Configure environment variables that can be accessed at runtime
  publicRuntimeConfig: {
    apiUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000",
  },
};

export default nextConfig;
