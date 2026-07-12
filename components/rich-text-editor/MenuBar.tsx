import { Editor } from "@tiptap/react";
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

export function MenuBar({ editor }: iAppProps) {
  if (!editor) {
    return null;
  }

  return (
    <div className="border border-input rounded-tl-lg p-2 bg-card flex flex-wrap gap-1 items-center">
      <div className="flex flex-wrap gap-1">
        <Tooltip>
          <TooltipTrigger
            render={
              <Toggle
                size="sm"
                pressed={editor.isActive("bold")}
                onPressedChange={() => editor.chain().toggleBold().run()}
                className={cn(
                  editor.isActive("bold") && "bg-muted text-muted-foreground",
                )}
              >
                <BoldIcon />
              </Toggle>
            }
          />
          <TooltipContent>
            <p>Add to library</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger
            render={
              <Toggle
                size="sm"
                pressed={editor.isActive("italic")}
                onPressedChange={() => editor.chain().toggleItalic().run()}
                className={cn(
                  editor.isActive("italic") && "bg-muted text-muted-foreground",
                )}
              >
                <ItalicIcon />
              </Toggle>
            }
          />
          <TooltipContent>
            <p>Italic</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger
            render={
              <Toggle
                size="sm"
                pressed={editor.isActive("strike")}
                onPressedChange={() => editor.chain().toggleStrike().run()}
                className={cn(
                  editor.isActive("strike") && "bg-muted text-muted-foreground",
                )}
              >
                <StrikethroughIcon />
              </Toggle>
            }
          />
          <TooltipContent>
            <p>Strike</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger
            render={
              <Toggle
                size="sm"
                pressed={editor.isActive("heading", { level: 1 })}
                onPressedChange={() =>
                  editor.chain().toggleHeading({ level: 1 }).run()
                }
                className={cn(
                  editor.isActive("heading", { level: 1 }) &&
                    "bg-muted text-muted-foreground",
                )}
              >
                <Heading1Icon />
              </Toggle>
            }
          />
          <TooltipContent>
            <p>Heading 1</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger
            render={
              <Toggle
                size="sm"
                pressed={editor.isActive("heading", { level: 2 })}
                onPressedChange={() =>
                  editor.chain().toggleHeading({ level: 2 }).run()
                }
                className={cn(
                  editor.isActive("heading", { level: 2 }) &&
                    "bg-muted text-muted-foreground",
                )}
              >
                <Heading2Icon />
              </Toggle>
            }
          />
          <TooltipContent>
            <p>Heading 2</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger
            render={
              <Toggle
                size="sm"
                pressed={editor.isActive("heading", { level: 3 })}
                onPressedChange={() =>
                  editor.chain().toggleHeading({ level: 3 }).run()
                }
                className={cn(
                  editor.isActive("heading", { level: 3 }) &&
                    "bg-muted text-muted-foreground",
                )}
              >
                <Heading3Icon />
              </Toggle>
            }
          />
          <TooltipContent>
            <p>Heading 3</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger
            render={
              <Toggle
                size="sm"
                pressed={editor.isActive("bulletList")}
                onPressedChange={() => editor.chain().toggleBulletList().run()}
                className={cn(
                  editor.isActive("bulletList") &&
                    "bg-muted text-muted-foreground",
                )}
              >
                <ListIcon />
              </Toggle>
            }
          />
          <TooltipContent>
            <p>Bullet List</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger
            render={
              <Toggle
                size="sm"
                pressed={editor.isActive("orderedList")}
                onPressedChange={() => editor.chain().toggleOrderedList().run()}
                className={cn(
                  editor.isActive("orderedList") &&
                    "bg-muted text-muted-foreground",
                )}
              >
                <ListOrderedIcon />
              </Toggle>
            }
          />
          <TooltipContent>
            <p>Ordered List</p>
          </TooltipContent>
        </Tooltip>
      </div>

      <div className="w-px h-6 bg-border mx-2"></div>

      <div className="flex flex-wrap gap-1">
        <Tooltip>
          <TooltipTrigger
            render={
              <Toggle
                size="sm"
                pressed={editor.isActive({ textAlign: "left" })}
                onPressedChange={() =>
                  editor.chain().toggleTextAlign("left").run()
                }
                className={cn(
                  editor.isActive({ textAlign: "left" }) &&
                    "bg-muted text-muted-foreground",
                )}
              >
                <AlignLeftIcon />
              </Toggle>
            }
          />
          <TooltipContent>
            <p>Align Left</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger
            render={
              <Toggle
                size="sm"
                pressed={editor.isActive({ textAlign: "center" })}
                onPressedChange={() =>
                  editor.chain().toggleTextAlign("center").run()
                }
                className={cn(
                  editor.isActive({ textAlign: "center" }) &&
                    "bg-muted text-muted-foreground",
                )}
              >
                <AlignCenterIcon />
              </Toggle>
            }
          />
          <TooltipContent>
            <p>Align Center</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger
            render={
              <Toggle
                size="sm"
                pressed={editor.isActive({ textAlign: "right" })}
                onPressedChange={() =>
                  editor.chain().toggleTextAlign("right").run()
                }
                className={cn(
                  editor.isActive({ textAlign: "left" }) &&
                    "bg-muted text-muted-foreground",
                )}
              >
                <AlignRightIcon />
              </Toggle>
            }
          />
          <TooltipContent>
            <p>Align Right</p>
          </TooltipContent>
        </Tooltip>
      </div>

      <div className="w-px h-6 bg-border mx-2"></div>

      <div className="flex flex-wrap gap-1">
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                size="sm"
                variant="ghost"
                type="button"
                onClick={() => editor.chain().undo().run()}
                disabled={!editor.can().undo()}
              >
                <UndoIcon />
              </Button>
            }
          />
          <TooltipContent>
            <p>Undo</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                size="sm"
                variant="ghost"
                type="button"
                onClick={() => editor.chain().redo().run()}
                disabled={!editor.can().redo()}
              >
                <RedoIcon />
              </Button>
            }
          />
          <TooltipContent>
            <p>Redo</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}
