import { RenderDescription } from "@/components/rich-text-editor/RenderDescription";
import { Separator } from "@/components/ui/separator";
import { type JSONContent } from "@tiptap/react";

import { MarkCompleteButton } from "./MarkCompleteButton";

interface LessonInfoProps {
  lessonId: string;
  title: string;
  description: string | null;
}

function parseDescription(description: string | null): JSONContent | null {
  if (!description) return null;
  try {
    const parsed = JSON.parse(description) as JSONContent;
    if (!parsed || typeof parsed !== "object") return null;
    return parsed;
  } catch {
    return null;
  }
}

export function LessonInfo({
  lessonId,
  title,
  description,
}: LessonInfoProps) {
  const parsed = parseDescription(description);

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight leading-tight">
          {title}
        </h1>
        <MarkCompleteButton lessonId={lessonId} />
      </div>

      <Separator />

      {parsed ? (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            About this lesson
          </h2>
          <RenderDescription json={parsed} />
        </section>
      ) : (
        <p className="text-sm text-muted-foreground">
          No description provided for this lesson.
        </p>
      )}
    </div>
  );
}
