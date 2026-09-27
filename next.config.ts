import type { NextConfig } from "next";
import { env } from "./lib/env";

// Presigned URLs come from AWS_ENDPOINT_URL_S3 using virtual-hosted-style
// addressing, so the allowed image host must be derived from that endpoint
// rather than hardcoded.
const s3Host = new URL(env.AWS_ENDPOINT_URL_S3).hostname;

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: `${env.NEXT_PUBLIC_S3_BUCKET_NAME_IMAGES}.${s3Host}`,
      },
    ],
  },
};

export default nextConfig;
