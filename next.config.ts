import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Notes autosave posts the whole note document.
    serverActions: { bodySizeLimit: "10mb" },
  },
  async headers() {
    return [
      {
        // The console is gated on identity; this only keeps it out of indexes.
        // Deliberately NOT paired with a robots.txt Disallow — that would
        // advertise the path to anyone who reads it.
        source: "/admin/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
      { source: "/admin", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] },
    ];
  },
};

export default nextConfig;
