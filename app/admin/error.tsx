"use client";

import { RouteError } from "@/components/general/RouteError";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <RouteError
      error={error}
      reset={reset}
      title="Admin error"
      description="Something went wrong while loading the admin area. Please try again."
    />
  );
}
