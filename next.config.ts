import type { NextConfig } from "next";
import { env } from "./lib/env";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: `${env.NEXT_PUBLIC_S3_BUCKET_NAME_IMAGES}.t3.storage.dev`,
      },
    ],
  },
};

export default nextConfig;
