import "server-only";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function getOptionalSession() {
  return auth.api.getSession({ headers: await headers() });
}
