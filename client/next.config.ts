import type { NextConfig } from "next";

const API_URL = process.env.API_URL ?? "http://localhost:3010";

// same-origin proxy: no CORS in dev, auth cookies stay first-party
const nextConfig: NextConfig = {
  reactStrictMode: true,
  turbopack: {
    rules: {
      "*.css": { loaders: ["@tailwindcss/turbopack"], as: "*.css" },
    },
  },
  async rewrites() {
    return [{ source: "/api/v1/:path*", destination: `${API_URL}/api/v1/:path*` }];
  },
};

export default nextConfig;
