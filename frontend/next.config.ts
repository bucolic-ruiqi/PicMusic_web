import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "i.pravatar.cc",
      },
      // Added Alibaba Cloud OSS bucket domain for user-uploaded images
      {
        protocol: "https",
        hostname: "videos-lyx.oss-cn-hangzhou.aliyuncs.com",
      },
    ],
  },
};

export default nextConfig;
