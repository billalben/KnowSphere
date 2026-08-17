import "server-only";

import { S3Client as AwsS3Client } from "@aws-sdk/client-s3";
import { env } from "./env";

export const S3Client = new AwsS3Client({
  region: env.AWS_REGION,
  endpoint: env.AWS_ENDPOINT_URL_S3,
  forcePathStyle: false,
  credentials: {
    accessKeyId: env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
  },
});