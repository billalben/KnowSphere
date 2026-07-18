"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { chapterSchema, ChapterSchemaType } from "@/lib/zodSchemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { PlusIcon } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { tryCatch } from "@/hooks/try-catch";
import { createChapter } from "../actions";
import { toast } from "sonner";

export default function NewChapterModal({ courseId }: { courseId: string }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleOpenChange = (open: boolean) => {
    setIsModalOpen(open);
  };

  const form = useForm<ChapterSchemaType>({
    resolver: zodResolver(chapterSchema),
    defaultValues: {
      name: "",
      courseId,
    },
  });

  const onSubmit = (values: ChapterSchemaType) => {
    startTransition(async () => {
      const { data: result, error } = await tryCatch(createChapter(values));

      if (error) {
        toast.error(error.message);
        return;
      }

      if (result?.status === "success") {
        toast.success(result.message);
        form.reset();
        setIsModalOpen(false);
      } else if (result?.status === "error") {
        toast.error(result.message);
      }
    });
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          <Button variant="outline" size="sm" className="gap-2">
            <PlusIcon className="size-4" />
            New Chapter
          </Button>
        }
      />
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>New Chapter</DialogTitle>
          <DialogDescription>
            Here you can add a new chapter to your course
          </DialogDescription>
        </DialogHeader>

        <form id="chapter-form" onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel htmlFor="name">Name</FieldLabel>
                  <Input
                    {...field}
                    id="name"
                    placeholder="Chapter Name"
                    aria-invalid={fieldState.invalid}
                  />
                  <FieldDescription>
                    Enter the name of the chapter
                  </FieldDescription>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </FieldGroup>
        </form>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsModalOpen(false)}
          >
            Cancel
          </Button>
          <Button type="submit" form="chapter-form" disabled={isPending}>
            {isPending ? "Adding..." : "Add Chapter"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
