import { Badge } from "@/components/ui/badge";
import { SparklesIcon } from "lucide-react";

import { FaqList } from "./FaqList";

export function FAQ() {
  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-72 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-primary/5 via-primary/2 to-transparent"
      />

      <div className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-24 lg:px-8">
        <div className="mx-auto mb-12 max-w-2xl space-y-4 text-center">
          <Badge variant="secondary" className="gap-1.5">
            <SparklesIcon className="size-3" />
            Frequently asked questions
          </Badge>

          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-balance">
            Got questions? We&rsquo;ve got answers.
          </h2>

          <p className="text-base md:text-lg text-muted-foreground leading-relaxed text-balance">
            Quick answers to the things people ask us most often. Can&rsquo;t
            find what you&rsquo;re looking for?{" "}
            <a
              href="/contact"
              className="font-medium text-foreground underline-offset-4 hover:underline"
            >
              Reach out
            </a>
            .
          </p>
        </div>

        <FaqList />
      </div>
    </section>
  );
}
