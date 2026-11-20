import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Prototype only: ask search engines not to list any page, so the demo
  // site can't be found by searching. Testers reach it by direct link.
  headers() {
    return [{ source: "/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] }];
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
