import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Notes autosave posts the whole note document.
    serverActions: { bodySizeLimit: "10mb" },
  },
};

export default nextConfig;
