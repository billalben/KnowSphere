import Link from "next/link";
import { SearchXIcon, type LucideIcon } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface NotFoundViewProps {
  title?: string;
  description?: React.ReactNode;
  backHref?: string;
  backLabel?: string;
  icon?: LucideIcon;
  className?: string;
}

export function NotFoundView({
  title = "Page not found",
  description = "The page you're looking for doesn't exist or may have been moved.",
  backHref = "/",
  backLabel = "Back to home",
  icon: Icon = SearchXIcon,
  className,
}: NotFoundViewProps) {
  return (
    <div
      className={cn(
        "mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center gap-6 px-4 py-24 text-center",
        className,
      )}
    >
      <div className="flex size-14 items-center justify-center rounded-full bg-muted">
        <Icon className="size-7 text-muted-foreground" aria-hidden />
      </div>
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        <p className="text-sm text-muted-foreground text-balance">
          {description}
        </p>
      </div>
      <Link href={backHref} className={buttonVariants()}>
        {backLabel}
      </Link>
    </div>
  );
}
