"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { useTransition } from "react";
import { toast } from "sonner";
import { Loader2Icon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { tryCatch } from "@/hooks/try-catch";
import { categorySchema, type CategorySchemaType } from "@/lib/zodSchemas";
import type { tApiResponse } from "@/types/api";

import {
  createCategoryAction,
  updateCategoryAction,
} from "./actions";

type CategoryFormProps = {
  mode: "create" | "edit";
  categoryId?: string;
  defaultName?: string;
  onSuccess?: () => void;
};

export function CategoryForm({
  mode,
  categoryId,
  defaultName = "",
  onSuccess,
}: CategoryFormProps) {
  const [isPending, startTransition] = useTransition();

  const form = useForm<CategorySchemaType>({
    resolver: zodResolver(categorySchema),
    defaultValues: { name: defaultName },
  });

  const onSubmit = (values: CategorySchemaType) => {
    startTransition(async () => {
      const action =
        mode === "create"
          ? createCategoryAction({ name: values.name })
          : updateCategoryAction({ id: categoryId!, name: values.name });

      const { data: result, error } = await tryCatch(action);

      if (error) {
        toast.error("An unexpected error occurred. Please try again.");
        return;
      }

      if (result?.status === "success") {
        toast.success(result.message);
        form.reset({ name: "" });
        onSuccess?.();
      } else if (result?.status === "error") {
        toast.error(result.message);
      }
    });
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <FieldGroup>
        <Controller
          name="name"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="category-name">Name</FieldLabel>
              <Input
                {...field}
                id="category-name"
                placeholder="e.g. Web Development"
                aria-invalid={fieldState.invalid}
                disabled={isPending}
                autoComplete="off"
              />
              <FieldDescription>
                2–50 characters. Letters, numbers, spaces and &+- are allowed.
              </FieldDescription>
              {fieldState.invalid && (
                <FieldError errors={[fieldState.error]} />
              )}
            </Field>
          )}
        />

        <Field orientation="horizontal" className="justify-end">
          <Button type="submit" disabled={isPending}>
            {isPending ? (
              <>
                <Loader2Icon className="size-4 animate-spin" />
                {mode === "create" ? "Creating..." : "Saving..."}
              </>
            ) : mode === "create" ? (
              "Create Category"
            ) : (
              "Save Changes"
            )}
          </Button>
        </Field>
      </FieldGroup>
    </form>
  );
}

export type { tApiResponse };