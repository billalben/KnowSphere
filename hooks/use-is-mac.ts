"use client";

import { useState } from "react";

export function useIsMac(): boolean {
  const [isMac] = useState(() => {
    if (typeof navigator === "undefined") return false;
    return /Mac|iPhone|iPod|iPad/.test(navigator.platform);
  });

  return isMac;
}
