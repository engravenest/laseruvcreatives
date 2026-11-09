import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep build concurrency within shared-hosting resource limits.
  experimental: {
    cpus: 1,
    webpackMemoryOptimizations: true,
  },
};

export default nextConfig;
