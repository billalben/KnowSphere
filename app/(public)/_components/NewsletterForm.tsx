"use client";

import { CheckIcon, LoaderIcon, MailIcon } from "lucide-react";
import { useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (pending) return;

    const value = email.trim();
    if (!value) {
      setError("Email is required");
      return;
    }

    if (!EMAIL_REGEX.test(value)) {
      setError("Please enter a valid email address");
      return;
    }

    setError(null);
    setPending(true);

    // Placeholder: feature is not implemented yet. We just acknowledge receipt.
    setTimeout(() => {
      setPending(false);
      setSubmitted(true);
    }, 600);
  }

  if (submitted) {
    return (
      <div
        role="status"
        className="flex items-center gap-2 rounded-md border bg-background/50 px-3 py-2 text-sm"
      >
        <CheckIcon className="size-4 shrink-0 text-emerald-600" aria-hidden />
        <span>
          We&rsquo;ve got your email — the newsletter feature is coming soon.
        </span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2" noValidate>
      <div className="flex gap-2">
        <div className="relative flex-1 min-w-0">
          <MailIcon
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (error) setError(null);
            }}
            placeholder="your@email.com"
            className="pl-9 w-full"
            aria-label="Email address"
            aria-invalid={error ? true : undefined}
            disabled={pending}
          />
        </div>

        <Button type="submit" disabled={pending} className="shrink-0">
          {pending ? (
            <>
              <LoaderIcon className="size-4 animate-spin" />
              <span className="hidden sm:inline">Subscribing</span>
            </>
          ) : (
            "Subscribe"
          )}
        </Button>
      </div>

      {error && (
        <p className={cn("text-xs text-destructive")} role="alert">
          {error}
        </p>
      )}
      <p className="text-xs text-muted-foreground">
        Get notified when new courses go live. No spam, unsubscribe anytime.
      </p>
    </form>
  );
}
