"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2Icon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { tryCatch } from "@/hooks/try-catch";

import { deleteCategoryAction } from "../../../_components/actions";

interface DeleteCategoryFormProps {
  categoryId: string;
}

export function DeleteCategoryForm({ categoryId }: DeleteCategoryFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    startTransition(async () => {
      const { data: result, error } = await tryCatch(
        deleteCategoryAction({ id: categoryId }),
      );

      if (error) {
        toast.error("An unexpected error occurred. Please try again.");
        return;
      }

      if (result?.status === "success") {
        toast.success(result.message);
        router.push("/admin/categories");
      } else if (result?.status === "error") {
        toast.error(result.message);
      }
    });
  };

  return (
    <div className="flex justify-end gap-2">
      <Button
        type="button"
        variant="outline"
        onClick={() => router.back()}
        disabled={isPending}
      >
        Cancel
      </Button>
      <Button
        type="button"
        variant="destructive"
        onClick={handleDelete}
        disabled={isPending}
      >
        {isPending ? (
          <>
            <Loader2Icon className="size-4 animate-spin" />
            Deleting...
          </>
        ) : (
          "Delete Category"
        )}
      </Button>
    </div>
  );
}