"use client";

import { useState } from "react";
import { CheckIcon, CopyIcon, PrinterIcon } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CertificateActionsProps {
  url: string;
}

export function CertificateActions({ url }: CertificateActionsProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // no-op
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2 print:hidden">
      <button
        type="button"
        onClick={handleCopy}
        className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
      >
        {copied ? (
          <CheckIcon className="size-4 text-primary" />
        ) : (
          <CopyIcon className="size-4" />
        )}
        {copied ? "Copied" : "Copy public link"}
      </button>
      <button
        type="button"
        onClick={() => window.print()}
        className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
      >
        <PrinterIcon className="size-4" />
        Print
      </button>
    </div>
  );
}
