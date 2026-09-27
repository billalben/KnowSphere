"use client";

import { RouteError } from "@/components/general/RouteError";

export default function DashboardError({
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
      title="Dashboard error"
      description="We couldn't load this part of your dashboard. Please try again."
    />
  );
}
