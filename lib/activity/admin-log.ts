import "server-only";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";

import { logActivity } from "./log-activity";
import type { ActivityClient, LogActivityInput } from "./types";

export async function adminLog(
  input: Omit<LogActivityInput, "actorType" | "actorId" | "actorNameSnapshot">,
  client?: ActivityClient,
) {
  const session = await auth.api.getSession({ headers: await headers() });

  return logActivity(
    {
      ...input,
      actorType: "ADMIN",
      actorId: session?.user?.id ?? null,
      actorNameSnapshot: session?.user?.name ?? null,
    },
    client,
  );
}