"use client";

import { XIcon } from "lucide-react";
import { useState, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface iAppProps {
  index: number;
  text: string;
  explanation: string;
  marker: ReactNode;
  textError?: string;
  onTextChange: (value: string) => void;
  onExplanationChange: (value: string) => void;
  onRemove: () => void;
}

export function AnswerRow({
  index,
  text,
  explanation,
  marker,
  textError,
  onTextChange,
  onExplanationChange,
  onRemove,
}: iAppProps) {
  const [explanationOpen, setExplanationOpen] = useState(Boolean(explanation));
  const hasExplanation = Boolean(explanation);

  return (
    <li className="flex flex-col gap-2 rounded-md border border-border bg-background px-3 py-2">
      <div className="flex items-start gap-3">
        <div className="flex h-9 items-center">{marker}</div>
        <div className="flex flex-1 flex-col gap-1">
          <Input
            value={text}
            onChange={(e) => onTextChange(e.target.value)}
            placeholder={`Answer ${index + 1}`}
            aria-label={`Answer ${index + 1} text`}
            aria-invalid={Boolean(textError)}
          />
          {textError && (
            <p className="text-destructive text-xs font-normal">{textError}</p>
          )}
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onRemove}
          aria-label={`Delete answer ${index + 1}`}
        >
          <XIcon className="size-4" />
        </Button>
      </div>

      <Collapsible
        open={explanationOpen || hasExplanation}
        onOpenChange={setExplanationOpen}
        className="ml-9"
      >
        {!hasExplanation && !explanationOpen ? (
          <CollapsibleTrigger
            render={
              <button
                type="button"
                className="text-muted-foreground hover:text-foreground text-xs font-medium underline-offset-4 hover:underline"
              >
                Add explanation
              </button>
            }
          />
        ) : (
          <CollapsibleTrigger
            render={
              <button
                type="button"
                className="text-muted-foreground hover:text-foreground text-xs font-medium underline-offset-4 hover:underline"
              >
                {hasExplanation ? "Edit explanation" : "Add explanation"}
              </button>
            }
          />
        )}
        <CollapsibleContent
          className={cn(
            "overflow-hidden",
            "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-top-2 data-[state=closed]:animate-out data-[state=closed]:fade-out-0",
          )}
        >
          <Textarea
            value={explanation}
            onChange={(e) => onExplanationChange(e.target.value)}
            placeholder="Why this is the right answer (shown to the student after they check)."
            aria-label={`Answer ${index + 1} explanation`}
            className="min-h-20 text-sm"
          />
        </CollapsibleContent>
      </Collapsible>
    </li>
  );
}
