"use client";

import { useCallback, useState, useSyncExternalStore } from "react";

import {
  DEFAULT_VIEW,
  VIEWS,
  type ViewMode,
} from "@/app/(public)/courses/_lib/courses-filters";

const STORAGE_KEY = "knowsphere:courses:view-mode";

function isValidView(value: unknown): value is ViewMode {
  return typeof value === "string" && (VIEWS as readonly string[]).includes(value);
}

function readView(): ViewMode {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (isValidView(raw)) return raw;
  } catch {
    // localStorage may be unavailable (e.g., private mode, disabled storage).
  }
  return DEFAULT_VIEW;
}

function getServerSnapshot(): ViewMode {
  return DEFAULT_VIEW;
}

function getClientSnapshot(): ViewMode {
  return readView();
}

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

export function useViewMode(): [ViewMode, (next: ViewMode) => void] {
  const stored = useSyncExternalStore(
    subscribe,
    getClientSnapshot,
    getServerSnapshot,
  );

  // Track an override so in-tab updates reflect immediately without waiting
  // for the cross-tab `storage` event.
  const [override, setOverride] = useState<ViewMode | null>(null);

  const view = override ?? stored;

  const update = useCallback((next: ViewMode) => {
    setOverride(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // ignore persistence failure
    }
  }, []);

  return [view, update];
}
