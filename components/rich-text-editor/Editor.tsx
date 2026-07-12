"use client";

import { useEditor } from "@tiptap/react";
import StartedKit from "@tiptap/starter-kit";
import { MenuBar } from "./MenuBar";
import TextAlign from "@tiptap/extension-text-align";

export function RichTextEditor() {
  const editor = useEditor({
    extensions: [
      StartedKit,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
    ],
  });

  return (
    <div>
      <MenuBar editor={editor} />
    </div>
  );
}
