import "server-only";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";

import { logActivity } from "./log-activity";
import type { ActivityClient, LogActivityInput } from "./types";

type AdminLogInput = Omit<
  LogActivityInput,
  "actorType" | "actorId" | "actorNameSnapshot"
>;

/**
 * Resolving the session touches the auth layer; a failure there must not throw
 * out of an audit write, so fall back to an anonymous actor.
 */
async function resolveActor(): Promise<{
  id: string | null;
  name: string | null;
}> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    return {
      id: session?.user?.id ?? null,
      name: session?.user?.name ?? null,
    };
  } catch {
    return { id: null, name: null };
  }
}

export async function adminLog(input: AdminLogInput, client?: ActivityClient) {
  const actor = await resolveActor();

  return logActivity(
    {
      ...input,
      actorType: "ADMIN",
      actorId: actor.id,
      actorNameSnapshot: actor.name,
    },
    client,
  );
}

/**
 * Best-effort variant for call sites that run after the user-facing mutation has
 * already committed: an audit-log failure must never turn a success into an
 * error the admin is prompted to retry.
 */
export async function safeAdminLog(input: AdminLogInput): Promise<void> {
  try {
    await adminLog(input);
  } catch (error) {
    console.error("Failed to write admin activity log:", error);
  }
}
