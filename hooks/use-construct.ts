import { env } from "@/lib/env";

export function useConstructUrl(fileKey: string | null) {
  return `https://${env.NEXT_PUBLIC_S3_BUCKET_NAME_IMAGES}.t3.tigrisfiles.io/${fileKey}`;
}
