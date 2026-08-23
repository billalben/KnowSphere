"use client";

import { EditorContent, useEditor, useEditorState } from "@tiptap/react";
import StartedKit from "@tiptap/starter-kit";
import { Underline } from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";

import { MenuBar, type MenuBarState } from "./MenuBar";

interface RichTextEditorField {
  onChange: (value: string) => void;
  value: string | undefined;
}

const UnderlineWithShortcut = Underline.extend({
  addKeyboardShortcuts() {
    return {
      "Mod-Shift-u": () => this.editor.commands.toggleUnderline(),
    };
  },
});

const EMPTY_MENU_BAR_STATE: MenuBarState = {
  bold: false,
  italic: false,
  underline: false,
  strike: false,
  heading1: false,
  heading2: false,
  heading3: false,
  bulletList: false,
  orderedList: false,
  alignLeft: false,
  alignCenter: false,
  alignRight: false,
  canUndo: false,
  canRedo: false,
};

export function RichTextEditor({ field }: { field: RichTextEditorField }) {
  const editor = useEditor({
    extensions: [
      StartedKit,
      UnderlineWithShortcut,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
    ],
    editorProps: {
      attributes: {
        class:
          "min-h-[300px] p-4 focus:outline-none prose prose-sm sm:prose lg:prose-lg xl:prose-xl dark:prose-invert !w-full !max-w-none",
      },
    },
    onUpdate: ({ editor }) => {
      field.onChange(JSON.stringify(editor.getJSON()));
    },
    content: field.value ? JSON.parse(field.value) : "",
    immediatelyRender: false,
  });

  const state: MenuBarState = useEditorState({
    editor,
    selector: ({ editor }) => ({
      bold: editor?.isActive("bold") ?? false,
      italic: editor?.isActive("italic") ?? false,
      underline: editor?.isActive("underline") ?? false,
      strike: editor?.isActive("strike") ?? false,
      heading1: editor?.isActive("heading", { level: 1 }) ?? false,
      heading2: editor?.isActive("heading", { level: 2 }) ?? false,
      heading3: editor?.isActive("heading", { level: 3 }) ?? false,
      bulletList: editor?.isActive("bulletList") ?? false,
      orderedList: editor?.isActive("orderedList") ?? false,
      alignLeft: editor?.isActive({ textAlign: "left" }) ?? false,
      alignCenter: editor?.isActive({ textAlign: "center" }) ?? false,
      alignRight: editor?.isActive({ textAlign: "right" }) ?? false,
      canUndo: editor?.can().undo() ?? false,
      canRedo: editor?.can().redo() ?? false,
    }),
  }) ?? EMPTY_MENU_BAR_STATE;

  return (
    <div className="w-full border border-input rounded-lg overflow-hidden dark:bg-input/30">
      <MenuBar editor={editor} state={state} />
      <EditorContent editor={editor} />
    </div>
  );
}
