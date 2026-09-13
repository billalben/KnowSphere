import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { type ReactNode } from "react";

interface LegalPageProps {
  title: string;
  description: string;
  lastUpdated: string;
  effectiveDate: string;
  children: ReactNode;
}

export function LegalPage({
  title,
  description,
  lastUpdated,
  effectiveDate,
  children,
}: LegalPageProps) {
  return (
    <div className="pt-24 lg:pt-32 pb-12 lg:pb-16">
      <div className="mx-auto max-w-3xl space-y-10">
        <header className="relative space-y-4 text-center">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 -top-8 -z-10 mx-auto h-40 w-3/4 bg-linear-to-b from-primary/10 via-primary/5 to-transparent blur-2xl"
          />

          <Badge variant="secondary" className="mx-auto">
            Legal
          </Badge>

          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">
            {title}
          </h1>

          <p className="mx-auto max-w-2xl text-base md:text-lg text-muted-foreground leading-relaxed">
            {description}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
            <span>
              Last updated:{" "}
              <span className="font-medium text-foreground">{lastUpdated}</span>
            </span>
            <span aria-hidden>•</span>
            <span>
              Effective:{" "}
              <span className="font-medium text-foreground">
                {effectiveDate}
              </span>
            </span>
          </div>
        </header>

        <Separator />

        <article className="prose dark:prose-invert prose-li:marker:text-primary max-w-none">
          {children}
        </article>

        <section className="rounded-xl border bg-muted/30 p-6 md:p-8">
          <div className="flex flex-col items-center gap-3 text-center">
            <h3 className="text-lg font-semibold">Have questions?</h3>
            <p className="text-sm text-muted-foreground">
              We&rsquo;re happy to help if anything is unclear.
            </p>
            <Button render={<Link href="/contact">Contact us</Link>} />
          </div>
        </section>
      </div>
    </div>
  );
}
