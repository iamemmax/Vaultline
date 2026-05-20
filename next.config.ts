import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: {
    // MSW worker file lives in /public; nothing else needed.
  },
};

export default nextConfig;
