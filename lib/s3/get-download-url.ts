import "server-only";

import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import { env } from "@/lib/env";
import { S3Client } from "@/lib/S3Client";

const DEFAULT_EXPIRES_IN = 60 * 60;

export async function getDownloadUrl(
  key: string | null | undefined,
  opts?: { expiresIn?: number },
): Promise<string | null> {
  if (!key) return null;

  try {
    const command = new GetObjectCommand({
      Bucket: env.NEXT_PUBLIC_S3_BUCKET_NAME_IMAGES,
      Key: key,
    });

    return await getSignedUrl(S3Client, command, {
      expiresIn: opts?.expiresIn ?? DEFAULT_EXPIRES_IN,
    });
  } catch {
    return null;
  }
}

export async function getDownloadUrls(
  keys: (string | null | undefined)[],
  opts?: { expiresIn?: number },
): Promise<(string | null)[]> {
  return Promise.all(keys.map((k) => getDownloadUrl(k, opts)));
}
