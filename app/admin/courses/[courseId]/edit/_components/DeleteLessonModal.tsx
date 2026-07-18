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
import { deleteLesson } from "../actions";
import { toast } from "sonner";

export default function DeleteLessonModal({
  lessonId,
  courseId,
  chapterId,
}: {
  lessonId: string;
  courseId: string;
  chapterId: string;
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const handleOpenChange = (open: boolean) => {
    setIsModalOpen(open);
  };

  const [pending, startTransition] = useTransition();

  const handleDelete = () => {
    startTransition(async () => {
      const { data: result, error } = await tryCatch(
        deleteLesson({ courseId, chapterId, lessonId }),
      );

      if (error) {
        toast.error(error.message);
        return;
      }

      if (result?.status === "success") {
        toast.success(result.message);
        setIsModalOpen(false);
      } else if (result?.status === "error") {
        toast.error(result.message);
      }
    });
  };
  return (
    <AlertDialog open={isModalOpen} onOpenChange={handleOpenChange}>
      <AlertDialogTrigger
        render={
          <Button variant="ghost" size="icon">
            <Trash2Icon className="size-4" />
          </Button>
        }
      />
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Lesson</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this lesson?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsModalOpen(false)}
            disabled={pending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={pending}
          >
            {pending ? (
              <Loader2Icon className="size-4 animate-spin" />
            ) : (
              "Delete"
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
