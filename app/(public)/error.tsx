"use client";

import { RouteError } from "@/components/general/RouteError";

export default function PublicError({
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
      title="This page couldn't load"
      description="Something went wrong while loading this page. Please try again."
    />
  );
}
