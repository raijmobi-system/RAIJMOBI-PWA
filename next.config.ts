import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ['10.0.0.17', 'http://10.0.0.17:3000', 'tauri.localhost'], 
  reactStrictMode: false,
  output: 'export',
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  
};

export default nextConfig;