import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: { root: __dirname },
  async rewrites() {
    const apiOrigin = process.env.TRACKFLOW_API_INTERNAL_URL ?? "http://127.0.0.1:8000";

    return [
      {
        source: "/api/incidents/:path*",
        destination: `${apiOrigin.replace(/\/$/, "")}/api/incidents/:path*`,
      },
    ];
  },
};

export default nextConfig;
