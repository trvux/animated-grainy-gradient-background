import type { NextConfig } from "next";
import utwm from "unplugin-tailwindcss-mangle/webpack";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  webpack: (config, { dev }) => {
    // Only scramble classnames during production builds
    if (!dev) {
      config.plugins.push(utwm());
    }
    return config;
  },
};

export default nextConfig;
