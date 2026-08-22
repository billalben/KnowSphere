import Link from "next/link";
import { AwardIcon } from "lucide-react";

import { EmptyState } from "@/components/general/EmptyState";
import { buttonVariants } from "@/components/ui/button";
import type { tMyCertificate } from "@/app/data/user/get-my-certificates";

import { CertificateCard } from "./CertificateCard";

interface CertificatesListProps {
  certificates: tMyCertificate[];
}

export function CertificatesList({ certificates }: CertificatesListProps) {
  if (certificates.length === 0) {
    return (
      <EmptyState
        icon={AwardIcon}
        title="No certificates yet"
        description="Complete a course end-to-end to earn a certificate you can share."
        action={
          <Link href="/dashboard" className={buttonVariants()}>
            Browse my courses
          </Link>
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <p>
          <span className="font-medium text-foreground tabular-nums">
            {certificates.length}
          </span>{" "}
          {certificates.length === 1 ? "certificate" : "certificates"} earned
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {certificates.map((certificate) => (
          <CertificateCard key={certificate.id} certificate={certificate} />
        ))}
      </div>
    </div>
  );
}
