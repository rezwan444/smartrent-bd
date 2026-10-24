import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/webp", "image/avif"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],

    remotePatterns: [
      {
        protocol: "https",
        hostname: "gofl-stream.s3.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "gofl.pro",
      },
      {
        protocol: "https",
        hostname: "gofl-stream.s3.us-east-1.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "gofl-stream-dev.s3.us-east-1.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "gofl-stream-dev.s3.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "i.pravatar.cc",
      },
      {
        protocol: "https",
        hostname: "placehold.co",
      },
      {
        protocol: "https",
        hostname: "example.com",
      },
      {
        protocol: "https",
        hostname: "api.dicebear.com",
      },
    ],
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
};

export default nextConfig;
