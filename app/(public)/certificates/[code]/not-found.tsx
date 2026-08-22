import Link from "next/link";
import { AwardIcon } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";

export default function CertificateNotFound() {
  return (
    <div className="min-h-screen mx-auto flex max-w-md flex-col items-center justify-center gap-6 py-24 text-center">
      <div className="flex size-14 items-center justify-center rounded-full bg-muted">
        <AwardIcon className="size-7 text-muted-foreground" />
      </div>
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">
          Certificate not found
        </h1>
        <p className="text-sm text-muted-foreground text-balance">
          This certificate doesn&apos;t exist, or its owner has chosen to keep
          it private. If you got here from a shared link, please ask the owner
          to double-check the URL.
        </p>
      </div>
      <Link href="/" className={buttonVariants()}>
        Back to KnowSphere
      </Link>
    </div>
  );
}
