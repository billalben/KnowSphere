"use client";

import { useEffect, useState, useTransition } from "react";
import { Loader2Icon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface CommentFormProps {
  onSubmit: (content: string) => Promise<boolean>;
  placeholder?: string;
  submitLabel?: string;
  autoFocus?: boolean;
  onCancel?: () => void;
  defaultValue?: string;
  resetOnSuccess?: boolean;
  maxLength?: number;
}

export function CommentForm({
  onSubmit,
  placeholder = "Write a comment...",
  submitLabel = "Comment",
  autoFocus = false,
  onCancel,
  defaultValue = "",
  resetOnSuccess = true,
  maxLength = 2000,
}: CommentFormProps) {
  const [value, setValue] = useState(defaultValue);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setValue(defaultValue);
  }, [defaultValue]);

  const trimmed = value.trim();
  const initialTrimmed = defaultValue.trim();
  const isUnchanged = trimmed === initialTrimmed;
  const canSubmit = trimmed.length > 0 && !isUnchanged && !isPending;

  function handleSubmit() {
    if (!canSubmit) return;

    startTransition(async () => {
      const ok = await onSubmit(trimmed);
      if (ok && resetOnSuccess) {
        setValue("");
      }
    });
  }

  return (
    <div className="space-y-2">
      <Textarea
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        maxLength={maxLength}
        disabled={isPending}
      />
      <div className="flex items-center justify-end gap-2">
        {onCancel ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onCancel}
            disabled={isPending}
          >
            Cancel
          </Button>
        ) : null}
        <Button size="sm" onClick={handleSubmit} disabled={!canSubmit}>
          {isPending ? <Loader2Icon className="size-4 animate-spin" /> : null}
          {submitLabel}
        </Button>
      </div>
    </div>
  );
}