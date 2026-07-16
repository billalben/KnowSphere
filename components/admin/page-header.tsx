import { buttonVariants } from "@/components/ui/button";
import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

type PageHeaderProps = {
  backHref?: string;
  title: ReactNode;
};

export function PageHeader({ backHref, title }: PageHeaderProps) {
  return (
    <div className="mb-4 flex items-center gap-4">
      {backHref && (
        <Link
          href={backHref}
          className={buttonVariants({ variant: "outline", size: "icon" })}
        >
          <ArrowLeftIcon size={16} />
        </Link>
      )}
      <h1 className="text-2xl font-bold">{title}</h1>
    </div>
  );
}