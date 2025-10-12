import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',  // Static export for Cloudflare Pages
  images: {
    unoptimized: true,  // Required for static export
    remotePatterns: [
      {
        protocol: "https",
        hostname: "i.ytimg.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "img.youtube.com",
        pathname: "/**",
      },
    ],
  },
  trailingSlash: true,  // Better for static hosting
};

export default nextConfig;
