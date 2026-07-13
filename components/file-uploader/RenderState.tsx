import { cn } from "@/lib/utils";
import { CloudUploadIcon, ImageIcon } from "lucide-react";
import { Button } from "../ui/button";

export function RenderEmptyState({ isDragActive }: { isDragActive: boolean }) {
  return (
    <div className="text-center">
      <div className="flex items-center justify-center mx-auto size-12 rounded-full bg-muted mb-4">
        <CloudUploadIcon
          className={cn(
            "size-6 text-muted-foreground",
            isDragActive && "text-primary",
          )}
        />
      </div>

      <p className="text-base font-semibold text-foreground">
        Drop your fiels here or{" "}
        <span className="text-primary font-bold cursor-pointer">
          click to upload
        </span>
      </p>

      <Button className="mt-4" type="button">
        Select File
      </Button>
    </div>
  );
}

export function RenderErrorState() {
  return (
    <div className="text-center">
      <ImageIcon className="size-10 mx-auto mb-3" />

      <div className="flex items-center justify-center mx-auto size-12 rounded-full bg-destructive/30 mb-4">
        <ImageIcon className={cn("size-6 text-destructive")} />
      </div>

      <p className="text-base font-semibold">Upload Failed</p>
      <p className="text-xs text-muted-foreground mt-1">Something went wrong</p>
      <p className="text-xl text-muted-foreground mt-1">
        Click or drag file to retry
      </p>
    </div>
  );
}
