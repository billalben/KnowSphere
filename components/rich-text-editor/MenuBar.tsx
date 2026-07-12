import { type ElementType } from "react";
import { type Editor } from "@tiptap/react";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { Toggle } from "../ui/toggle";
import {
  AlignCenterIcon,
  AlignLeftIcon,
  AlignRightIcon,
  BoldIcon,
  Heading1Icon,
  Heading2Icon,
  Heading3Icon,
  ItalicIcon,
  ListIcon,
  ListOrderedIcon,
  RedoIcon,
  StrikethroughIcon,
  UndoIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";

interface iAppProps {
  editor: Editor | null;
}

interface ToggleItem {
  icon: ElementType;
  label: string;
  pressed: boolean;
  onPressedChange: () => void;
}

interface ButtonItem {
  icon: ElementType;
  label: string;
  onClick: () => void;
  disabled: boolean;
}

export function MenuBar({ editor }: iAppProps) {
  if (!editor) return null;

  const toggleItems: ToggleItem[] = [
    {
      icon: BoldIcon,
      label: "Bold",
      pressed: editor.isActive("bold"),
      onPressedChange: () => editor.chain().toggleBold().run(),
    },
    {
      icon: ItalicIcon,
      label: "Italic",
      pressed: editor.isActive("italic"),
      onPressedChange: () => editor.chain().toggleItalic().run(),
    },
    {
      icon: StrikethroughIcon,
      label: "Strike",
      pressed: editor.isActive("strike"),
      onPressedChange: () => editor.chain().toggleStrike().run(),
    },
    {
      icon: Heading1Icon,
      label: "Heading 1",
      pressed: editor.isActive("heading", { level: 1 }),
      onPressedChange: () => editor.chain().toggleHeading({ level: 1 }).run(),
    },
    {
      icon: Heading2Icon,
      label: "Heading 2",
      pressed: editor.isActive("heading", { level: 2 }),
      onPressedChange: () => editor.chain().toggleHeading({ level: 2 }).run(),
    },
    {
      icon: Heading3Icon,
      label: "Heading 3",
      pressed: editor.isActive("heading", { level: 3 }),
      onPressedChange: () => editor.chain().toggleHeading({ level: 3 }).run(),
    },
    {
      icon: ListIcon,
      label: "Bullet List",
      pressed: editor.isActive("bulletList"),
      onPressedChange: () => editor.chain().toggleBulletList().run(),
    },
    {
      icon: ListOrderedIcon,
      label: "Ordered List",
      pressed: editor.isActive("orderedList"),
      onPressedChange: () => editor.chain().toggleOrderedList().run(),
    },
  ];

  const alignItems: ToggleItem[] = [
    {
      icon: AlignLeftIcon,
      label: "Align Left",
      pressed: editor.isActive({ textAlign: "left" }),
      onPressedChange: () => editor.chain().toggleTextAlign("left").run(),
    },
    {
      icon: AlignCenterIcon,
      label: "Align Center",
      pressed: editor.isActive({ textAlign: "center" }),
      onPressedChange: () => editor.chain().toggleTextAlign("center").run(),
    },
    {
      icon: AlignRightIcon,
      label: "Align Right",
      pressed: editor.isActive({ textAlign: "right" }),
      onPressedChange: () => editor.chain().toggleTextAlign("right").run(),
    },
  ];

  const historyItems: ButtonItem[] = [
    {
      icon: UndoIcon,
      label: "Undo",
      onClick: () => editor.chain().undo().run(),
      disabled: !editor.can().undo(),
    },
    {
      icon: RedoIcon,
      label: "Redo",
      onClick: () => editor.chain().redo().run(),
      disabled: !editor.can().redo(),
    },
  ];

  const renderToggleGroup = (items: ToggleItem[]) =>
    items.map((item) => {
      const Icon = item.icon;
      return (
        <Tooltip key={item.label}>
          <TooltipTrigger
            render={
              <Toggle
                size="sm"
                pressed={item.pressed}
                onPressedChange={item.onPressedChange}
                className={cn(item.pressed && "bg-muted text-muted-foreground")}
              >
                <Icon />
              </Toggle>
            }
          />
          <TooltipContent>
            <p>{item.label}</p>
          </TooltipContent>
        </Tooltip>
      );
    });

  const renderButtonGroup = (items: ButtonItem[]) =>
    items.map((item) => {
      const Icon = item.icon;
      return (
        <Tooltip key={item.label}>
          <TooltipTrigger
            render={
              <Button
                size="sm"
                variant="ghost"
                type="button"
                onClick={item.onClick}
                disabled={item.disabled}
              >
                <Icon />
              </Button>
            }
          />
          <TooltipContent>
            <p>{item.label}</p>
          </TooltipContent>
        </Tooltip>
      );
    });

  return (
    <div className="border border-input border-t-0 border-x-0 rounded-tl-lg p-2 bg-card flex flex-wrap gap-1 items-center">
      <div className="flex flex-wrap gap-1">
        {renderToggleGroup(toggleItems)}
      </div>

      <div className="w-px h-6 bg-border mx-2" />

      <div className="flex flex-wrap gap-1">
        {renderToggleGroup(alignItems)}
      </div>

      <div className="w-px h-6 bg-border mx-2" />

      <div className="flex flex-wrap gap-1">
        {renderButtonGroup(historyItems)}
      </div>
    </div>
  );
}
