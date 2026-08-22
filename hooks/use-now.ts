"use client";

import { useEffect, useState } from "react";

const DEFAULT_INTERVAL_MS = 60_000;

export function useNow(intervalMs: number = DEFAULT_INTERVAL_MS): number {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
    }, intervalMs);
    return () => clearInterval(interval);
  }, [intervalMs]);

  return now;
}