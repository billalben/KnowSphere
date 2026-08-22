"use client";

import { useSortable } from "@dnd-kit/react/sortable";
import { ChevronDownIcon, GripVertical } from "lucide-react";
import { useState } from "react";
import type { UseFormReturn } from "react-hook-form";
import {
  useFieldArray,
  useFormContext,
  useWatch,
} from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  EQuizQuestionType,
  type LessonQuizSchemaType,
  type QuizAnswerInputSchemaType,
} from "@/lib/zodSchemas";
import { cn } from "@/lib/utils";

import { AnswerRow } from "./AnswerRow";

type QuizFormValues = Omit<LessonQuizSchemaType, "lessonId">;
type QuizAnswerFormValue = QuizAnswerInputSchemaType;

interface iAppProps {
  index: number;
  fieldId: string;
  onRemove: () => void;
  form: UseFormReturn<QuizFormValues>;
  watchedType: EQuizQuestionType;
}

const QUESTION_TYPE_OPTIONS = [
  { value: EQuizQuestionType.SINGLE, label: "Single choice" },
  { value: EQuizQuestionType.MULTIPLE, label: "Multiple choice" },
];

function truncate(text: string, max: number): string {
  const trimmed = text.trim();
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max)}…`;
}

export function SortableQuestionCard({
  index,
  fieldId,
  onRemove,
  form,
  watchedType,
}: iAppProps) {
  const { register, control, setValue } = useFormContext();
  const [open, setOpen] = useState(true);
  const { ref, handleRef, isDragging } = useSortable({
    id: fieldId,
    index,
  });

  const answersName = `questions.${index}.answers` as const;
  const textName = `questions.${index}.text` as const;
  const typeName = `questions.${index}.type` as const;

  const { fields: answerFields, append, remove } = useFieldArray({
    control,
    name: answersName,
  });

  const watchedAnswers = useWatch({
    control,
    name: answersName,
  }) as unknown as QuizAnswerFormValue[] | undefined;

  const watchedQuestionText =
    (useWatch({ control, name: textName }) as string | undefined) ?? "";

  const correctAnswerIndex = (() => {
    if (!watchedAnswers) return -1;
    const idx = watchedAnswers.findIndex(
      (a: QuizAnswerFormValue) => a.isCorrect,
    );
    return idx;
  })();

  const handleTypeChange = (nextType: EQuizQuestionType) => {
    setValue(typeName, nextType, { shouldDirty: true });

    if (
      nextType === EQuizQuestionType.SINGLE &&
      watchedAnswers &&
      watchedAnswers.filter((a: QuizAnswerFormValue) => a.isCorrect).length > 1
    ) {
      const firstCorrectIndex = watchedAnswers.findIndex(
        (a: QuizAnswerFormValue) => a.isCorrect,
      );
      watchedAnswers.forEach(
        (_: QuizAnswerFormValue, i: number) => {
          setValue(
            `${answersName}.${i}.isCorrect`,
            i === firstCorrectIndex,
            { shouldDirty: true },
          );
        },
      );
    }
  };

  const handleAddAnswer = () => {
    append({ text: "", isCorrect: false });
  };

  const handleRemoveAnswer = (answerIndex: number) => {
    remove(answerIndex);
  };

  const handleSingleCorrectChange = (value: unknown) => {
    const newIndex = Number(value);
    if (Number.isNaN(newIndex)) return;
    if (!watchedAnswers) return;

    watchedAnswers.forEach(
      (_: QuizAnswerFormValue, i: number) => {
        setValue(`${answersName}.${i}.isCorrect`, i === newIndex, {
          shouldDirty: true,
        });
      },
    );
  };

  const handleMultipleCorrectChange = (
    answerIndex: number,
    value: boolean,
  ) => {
    setValue(`${answersName}.${answerIndex}.isCorrect`, value, {
      shouldDirty: true,
    });
  };

  const handleAnswerTextChange = (answerIndex: number, text: string) => {
    setValue(`${answersName}.${answerIndex}.text`, text, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  const handleAnswerExplanationChange = (
    answerIndex: number,
    explanation: string,
  ) => {
    setValue(`${answersName}.${answerIndex}.explanation`, explanation, {
      shouldDirty: true,
    });
  };

  const isSingle = watchedType === EQuizQuestionType.SINGLE;

  return (
    <div
      ref={ref as React.Ref<HTMLDivElement>}
      className={cn(isDragging && "opacity-50")}
    >
      <Collapsible open={open} onOpenChange={setOpen}>
        <Card size="sm">
          <CardHeader className="flex flex-row items-center justify-between gap-2">
            <div className="flex flex-1 items-center gap-2">
              <button
                ref={handleRef as React.Ref<HTMLButtonElement>}
                type="button"
                aria-label="Drag question"
                className="cursor-grab text-muted-foreground hover:text-foreground"
              >
                <GripVertical className="size-4" />
              </button>

              <CollapsibleTrigger
                render={
                  <button
                    type="button"
                    className="flex min-w-0 flex-1 items-center gap-2 text-left"
                    aria-label={
                      open ? "Collapse question" : "Expand question"
                    }
                  >
                    <div className="flex min-w-0 flex-1 flex-col">
                      <CardTitle className="text-base">
                        Question {index + 1}
                      </CardTitle>
                      {!open && watchedQuestionText.trim() && (
                        <span className="truncate text-xs text-muted-foreground">
                          {truncate(watchedQuestionText, 80)}
                        </span>
                      )}
                    </div>
                    <ChevronDownIcon
                      className={cn(
                        "size-4 shrink-0 text-muted-foreground transition-transform",
                        open && "rotate-180",
                      )}
                    />
                  </button>
                }
              />
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onRemove}
              aria-label="Delete question"
            >
              Delete
            </Button>
          </CardHeader>

          <CollapsibleContent>
            <CardContent className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label
                  htmlFor={`question-text-${index}`}
                  className="text-sm font-medium"
                >
                  Question text
                </label>
                <Input
                  id={`question-text-${index}`}
                  placeholder="What is...?"
                  {...register(textName)}
                  aria-invalid={Boolean(
                    form.formState.errors.questions?.[index]?.text,
                  )}
                />
                {form.formState.errors.questions?.[index]?.text?.message && (
                  <p className="text-destructive text-sm font-normal">
                    {form.formState.errors.questions[index]?.text?.message}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <label
                  htmlFor={`question-type-${index}`}
                  className="text-sm font-medium"
                >
                  Answer type
                </label>
                <Select
                  value={watchedType}
                  onValueChange={(value) =>
                    handleTypeChange(value as EQuizQuestionType)
                  }
                >
                  <SelectTrigger
                    id={`question-type-${index}`}
                    className="w-full"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {QUESTION_TYPE_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">Answers</p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddAnswer}
                  >
                    Add answer
                  </Button>
                </div>

                {isSingle ? (
                  <RadioGroup
                    value={
                      correctAnswerIndex >= 0
                        ? String(correctAnswerIndex)
                        : undefined
                    }
                    onValueChange={handleSingleCorrectChange}
                  >
                    <ul className="flex flex-col gap-2">
                      {answerFields.map((answerField, answerIndex) => {
                        const answerErrors =
                          form.formState.errors.questions?.[index]?.answers?.[
                            answerIndex
                          ];
                        const text =
                          watchedAnswers?.[answerIndex]?.text ?? "";
                        const explanation =
                          watchedAnswers?.[answerIndex]?.explanation ?? "";

                        return (
                          <AnswerRow
                            key={answerField.id}
                            index={answerIndex}
                            text={text}
                            explanation={explanation}
                            textError={answerErrors?.text?.message}
                            marker={
                              <RadioGroupItem
                                value={String(answerIndex)}
                                aria-label={`Mark answer ${answerIndex + 1} as correct`}
                              />
                            }
                            onTextChange={(value) =>
                              handleAnswerTextChange(answerIndex, value)
                            }
                            onExplanationChange={(value) =>
                              handleAnswerExplanationChange(answerIndex, value)
                            }
                            onRemove={() => handleRemoveAnswer(answerIndex)}
                          />
                        );
                      })}
                    </ul>
                  </RadioGroup>
                ) : (
                  <ul className="flex flex-col gap-2">
                    {answerFields.map((answerField, answerIndex) => {
                      const answerErrors =
                        form.formState.errors.questions?.[index]?.answers?.[
                          answerIndex
                        ];
                      const isCorrect =
                        watchedAnswers?.[answerIndex]?.isCorrect ?? false;
                      const text =
                        watchedAnswers?.[answerIndex]?.text ?? "";
                      const explanation =
                        watchedAnswers?.[answerIndex]?.explanation ?? "";

                      return (
                        <AnswerRow
                          key={answerField.id}
                          index={answerIndex}
                          text={text}
                          explanation={explanation}
                          textError={answerErrors?.text?.message}
                          marker={
                            <Checkbox
                              checked={isCorrect}
                              onCheckedChange={(checked) =>
                                handleMultipleCorrectChange(
                                  answerIndex,
                                  checked === true,
                                )
                              }
                              aria-label={`Mark answer ${answerIndex + 1} as correct`}
                            />
                          }
                          onTextChange={(value) =>
                            handleAnswerTextChange(answerIndex, value)
                          }
                          onExplanationChange={(value) =>
                            handleAnswerExplanationChange(answerIndex, value)
                          }
                          onRemove={() => handleRemoveAnswer(answerIndex)}
                        />
                      );
                    })}
                  </ul>
                )}

                {form.formState.errors.questions?.[index]?.answers?.message && (
                  <p className="text-destructive text-sm font-normal">
                    {form.formState.errors.questions[index]?.answers?.message}
                  </p>
                )}
                {form.formState.errors.questions?.[index]?.answers?.root
                  ?.message && (
                  <p className="text-destructive text-sm font-normal">
                    {
                      form.formState.errors.questions[index]?.answers?.root
                        ?.message
                    }
                  </p>
                )}
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>
    </div>
  );
}
