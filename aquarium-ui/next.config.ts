import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // Disable image optimization since we're serving locally
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
