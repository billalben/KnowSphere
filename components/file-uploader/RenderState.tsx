import { cn } from "@/lib/utils";
import {
  CloudUploadIcon,
  ImageIcon,
  Loader2Icon,
  TrashIcon,
} from "lucide-react";
import { Button } from "../ui/button";
import Image from "next/image";

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

export function RenderImageState({
  objectUrl,
  isDeleting,
  handleRemoveFile,
}: {
  objectUrl: string;
  isDeleting: boolean;
  handleRemoveFile: () => void;
}) {
  return (
    <div>
      <Image
        src={objectUrl}
        alt="Uploaded Image"
        className="w-full h-full object-cover mb-4"
        width={100}
        height={100}
      />
      <Button
        className="absolute top-2 right-2"
        type="button"
        variant="destructive"
        onClick={handleRemoveFile}
        disabled={isDeleting}
        title="Delete"
      >
        {isDeleting ? (
          <Loader2Icon className="size-4 animate-spin" />
        ) : (
          <TrashIcon className="size-4" />
        )}
      </Button>
    </div>
  );
}

export function RenderUploadingState({ progress }: { progress: number }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <Loader2Icon className="size-4 animate-spin" />
      <p className="text-sm text-muted-foreground">Uploading...</p>
      <p className="text-sm text-muted-foreground">{progress}%</p>
    </div>
  );
}
