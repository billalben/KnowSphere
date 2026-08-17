import { RenderDescription } from "@/components/rich-text-editor/RenderDescription";
import { type JSONContent } from "@tiptap/react";

interface DescriptionSectionProps {
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

export function DescriptionSection({ description }: DescriptionSectionProps) {
  const parsed = parseDescription(description);
  if (!parsed) return null;

  return (
    <section className="space-y-4">
      <h2 className="text-xl md:text-2xl font-semibold tracking-tight">
        Description
      </h2>
      <RenderDescription json={parsed} />
    </section>
  );
}
