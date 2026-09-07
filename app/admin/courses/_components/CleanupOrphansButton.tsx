"use client";

import { useState, useTransition } from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Loader2Icon, Trash2Icon } from "lucide-react";
import { tryCatch } from "@/hooks/try-catch";
import { toast } from "sonner";

import { cleanupOrphanUploadsAction } from "../_actions/cleanup-orphans";

export function CleanupOrphansButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleConfirm = () => {
    startTransition(async () => {
      const { data: result, error } = await tryCatch(
        cleanupOrphanUploadsAction({ olderThanHours: 24 }),
      );

      if (error) {
        toast.error("Failed to run cleanup");
        return;
      }

      if (!result) return;

      if (result.status === "success") {
        toast.success(result.message);
        setIsOpen(false);
      } else {
        toast.error(result.message);
      }
    });
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger
        render={
          <Button variant="outline" className="gap-1.5">
            <Trash2Icon className="size-3.5" />
            Cleanup orphan uploads
          </Button>
        }
      />
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Cleanup orphan uploads?</AlertDialogTitle>
          <AlertDialogDescription>
            Remove any Tigris uploads older than 24 hours that aren&apos;t
            linked to a course or lesson. This is best-effort and cannot be
            undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleConfirm}
            disabled={isPending}
          >
            {isPending ? (
              <Loader2Icon className="size-4 animate-spin" />
            ) : (
              "Run cleanup"
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
