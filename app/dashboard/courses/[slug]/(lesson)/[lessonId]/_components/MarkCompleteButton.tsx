"use client";

import { CheckCircle2Icon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

interface MarkCompleteButtonProps {
  lessonId: string;
}

export function MarkCompleteButton({ lessonId }: MarkCompleteButtonProps) {
  function handleClick() {
    void lessonId;
    toast.info("Progress tracking is coming soon.");
  }

  return (
    <Button onClick={handleClick} size="lg" className="w-full sm:w-auto">
      <CheckCircle2Icon className="size-4" />
      Mark as completed
    </Button>
  );
}
