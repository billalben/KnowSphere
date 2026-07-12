"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { InputGroup, InputGroupTextarea } from "@/components/ui/input-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  courseSchema,
  CourseSchemaType,
  ECourseLevel,
  ECourseStatus,
} from "@/lib/zodSchemas";
import { toast } from "sonner";
import { formatSlug } from "@/lib/formatSlug";

export function CreateCourseForm() {
  const form = useForm({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      title: "",
      description: "",
      smallDesc: "",
      fileKey: "",
      price: 0,
      duration: 1,
      level: ECourseLevel.BEGINNER,
      status: ECourseStatus.DRAFT,
      slug: "",
      category: "",
    },
  });

  const onSubmit = (data: CourseSchemaType) => {
    console.log("Form Data: ", data);
    toast.success("Course created successfully!", {
      description: "Your course has been created.",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Basic Information</CardTitle>
        <CardDescription>
          Provide the basic details for the new course.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form id="new-course-form" onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            {/* Title */}
            <Controller
              name="title"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="title">Title</FieldLabel>
                  <Input
                    {...field}
                    id="title"
                    placeholder="Course Title"
                    aria-invalid={fieldState.invalid}
                  />
                  <FieldDescription>
                    Enter a descriptive title for your course (5-32 characters)
                  </FieldDescription>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            {/* Slug */}
            <Controller
              name="slug"
              control={form.control}
              render={({ field, fieldState }) => {
                const transformedSlug = field.value
                  ? formatSlug(field.value)
                  : "";

                return (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="slug">Slug</FieldLabel>
                    <Input
                      {...field}
                      id="slug"
                      placeholder="course-slug"
                      aria-invalid={fieldState.invalid}
                    />
                    <FieldDescription>
                      {/* URL-friendly version of the course title */}
                      {transformedSlug && transformedSlug !== field.value && (
                        <>
                          suggested slug name:{" "}
                          <strong>{transformedSlug}</strong>
                        </>
                      )}
                    </FieldDescription>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                );
              }}
            />

            {/* Small Description */}
            <Controller
              name="smallDesc"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="smallDesc">Short Description</FieldLabel>
                  <Input
                    {...field}
                    id="smallDesc"
                    placeholder="A brief description"
                    aria-invalid={fieldState.invalid}
                  />
                  <FieldDescription>
                    Brief summary of the course (max 100 characters)
                  </FieldDescription>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            {/* Description */}
            <Controller
              name="description"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="description">Description</FieldLabel>
                  <InputGroup>
                    <InputGroupTextarea
                      {...field}
                      id="description"
                      placeholder="Detailed description of the course..."
                      rows={6}
                      className="min-h-24 resize-none"
                      aria-invalid={fieldState.invalid}
                    />
                  </InputGroup>
                  <FieldDescription>
                    Detailed description of what students will learn (max 500
                    characters)
                  </FieldDescription>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            {/* File Key */}
            <Controller
              name="fileKey"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="fileKey">File Key</FieldLabel>
                  <Input
                    {...field}
                    id="fileKey"
                    placeholder="course-thumbnail-key"
                    aria-invalid={fieldState.invalid}
                  />
                  <FieldDescription>
                    Storage key for course thumbnail/image
                  </FieldDescription>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            {/* Category */}
            <Controller
              name="category"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="category">Category</FieldLabel>
                  <Input
                    {...field}
                    id="category"
                    placeholder="e.g., Web Development"
                    aria-invalid={fieldState.invalid}
                  />
                  <FieldDescription>
                    Course category (at least 3 characters)
                  </FieldDescription>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            {/* Price */}
            <Controller
              name="price"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="price">Price</FieldLabel>
                  <Input
                    {...field}
                    id="price"
                    type="number"
                    min="0"
                    step="1.00"
                    placeholder="0.00"
                    aria-invalid={fieldState.invalid}
                    value={String(field.value ?? "")}
                    onChange={(e) => field.onChange(e.target.valueAsNumber)}
                  />
                  <FieldDescription>
                    Course price in dollars (minimum 0)
                  </FieldDescription>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            {/* Duration */}
            <Controller
              name="duration"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="duration">Duration (minutes)</FieldLabel>
                  <Input
                    {...field}
                    id="duration"
                    type="number"
                    min="1"
                    placeholder="60"
                    aria-invalid={fieldState.invalid}
                    value={String(field.value ?? "")}
                    onChange={(e) => field.onChange(e.target.valueAsNumber)}
                  />
                  <FieldDescription>
                    Total course duration in minutes
                  </FieldDescription>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            {/* Level */}
            <Controller
              name="level"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="level">Level</FieldLabel>
                  <Select
                    name={field.name}
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger id="level" aria-invalid={fieldState.invalid}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(ECourseLevel).map((level) => (
                        <SelectItem key={level} value={level}>
                          {level.charAt(0) + level.slice(1).toLowerCase()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FieldDescription>
                    Choose the difficulty level
                  </FieldDescription>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            {/* Status */}
            <Controller
              name="status"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="status">Status</FieldLabel>
                  <Select
                    name={field.name}
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger
                      id="status"
                      aria-invalid={fieldState.invalid}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(ECourseStatus).map((status) => (
                        <SelectItem key={status} value={status}>
                          {status.charAt(0) + status.slice(1).toLowerCase()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FieldDescription>
                    Set the course publication status
                  </FieldDescription>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </FieldGroup>
        </form>
      </CardContent>

      <CardFooter>
        <Field orientation="horizontal" className="justify-end">
          <Button type="button" variant="outline" onClick={() => form.reset()}>
            Reset
          </Button>
          <Button type="submit" form="new-course-form">
            Create Course
          </Button>
        </Field>
      </CardFooter>
    </Card>
  );
}
