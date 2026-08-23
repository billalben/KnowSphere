"use client";

import {
  CheckCircle2Icon,
  XCircleIcon,
} from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import type {
  tUserLessonQuiz,
  tUserQuizAnswer,
  tUserQuizQuestion,
} from "@/app/data/user/get-lesson-quiz";
import { cn } from "@/lib/utils";

interface QuizPlayerProps {
  quiz: tUserLessonQuiz;
}

export function QuizPlayer({ quiz }: QuizPlayerProps) {
  const [selections, setSelections] = useState<Record<string, Set<string>>>(
    {},
  );
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [step, setStep] = useState(0);
  const [finished, setFinished] = useState(false);

  const totalQuestions = quiz.questions.length;
  const isLast = step === totalQuestions - 1;
  const currentQuestion = quiz.questions[step];

  const submittedCount = checked.size;

  const correctCount = useMemo(() => {
    let count = 0;
    for (const q of quiz.questions) {
      if (!checked.has(q.id)) continue;
      const correctIds = new Set(
        q.answers.filter((a) => a.isCorrect).map((a) => a.id),
      );
      const picked = selections[q.id] ?? new Set<string>();
      const sameSize = picked.size === correctIds.size;
      const sameMembers =
        sameSize && Array.from(picked).every((id) => correctIds.has(id));
      if (sameMembers) count += 1;
    }
    return count;
  }, [checked, quiz.questions, selections]);

  function toggleSingle(questionId: string, answerId: string) {
    if (checked.has(questionId)) return;
    setSelections((prev) => ({
      ...prev,
      [questionId]: new Set([answerId]),
    }));
  }

  function toggleMultiple(questionId: string, answerId: string) {
    if (checked.has(questionId)) return;
    setSelections((prev) => {
      const next = new Set(prev[questionId] ?? []);
      if (next.has(answerId)) next.delete(answerId);
      else next.add(answerId);
      return { ...prev, [questionId]: next };
    });
  }

  function submitCurrent() {
    if (!currentQuestion) return;
    setChecked((prev) => {
      if (prev.has(currentQuestion.id)) return prev;
      const next = new Set(prev);
      next.add(currentQuestion.id);
      return next;
    });
  }

  function advance() {
    if (isLast) {
      setFinished(true);
      return;
    }
    setStep((s) => s + 1);
  }

  function goBack() {
    if (step === 0) return;
    setStep((s) => s - 1);
    setFinished(false);
  }

  function tryAgain() {
    setSelections({});
    setChecked(new Set());
    setStep(0);
    setFinished(false);
  }

  if (finished) {
    return (
      <div className="flex flex-col gap-4">
        <div
          className={cn(
            "rounded-md border px-4 py-4 text-sm",
            correctCount === totalQuestions
              ? "border-green-500/40 bg-green-50 text-green-900 dark:bg-green-950/30 dark:text-green-200"
              : "border-border bg-muted/40 text-foreground",
          )}
        >
          <p className="text-base font-semibold">
            You got{" "}
            <span
              className={cn(
                correctCount === totalQuestions
                  ? "text-green-700 dark:text-green-300"
                  : "text-foreground",
              )}
            >
              {correctCount}
            </span>{" "}
            out of <span>{totalQuestions}</span>{" "}
            {totalQuestions === 1 ? "question" : "questions"} right.
          </p>
          {correctCount < totalQuestions && (
            <p className="mt-1 text-xs text-muted-foreground">
              Go back through the questions to review the explanations.
            </p>
          )}
        </div>

        <div className="flex justify-end">
          <Button variant="outline" onClick={tryAgain}>
            Try again
          </Button>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return null;
  }

  const isCurrentChecked = checked.has(currentQuestion.id);
  const currentSelection: Set<string> =
    selections[currentQuestion.id] ?? new Set<string>();
  const hasCurrentSelection = currentSelection.size > 0;

  const primaryLabel = !isCurrentChecked
    ? "Submit answer"
    : isLast
      ? "See result"
      : "Next question";
  const primaryDisabled = !isCurrentChecked && !hasCurrentSelection;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
        <span>
          Question {step + 1} of {totalQuestions}
        </span>
        <span>
          {submittedCount} of {totalQuestions} submitted
        </span>
      </div>

      <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full bg-primary transition-all"
          style={{
            width: `${((step + 1) / totalQuestions) * 100}%`,
          }}
        />
      </div>

      <div className="flex flex-col gap-3">
        <p className="text-base font-medium">{currentQuestion.text}</p>
        <QuestionBody
          question={currentQuestion}
          selectedIds={currentSelection}
          revealed={isCurrentChecked}
          onSingleChange={(answerId) =>
            toggleSingle(currentQuestion.id, answerId)
          }
          onMultipleChange={(answerId) =>
            toggleMultiple(currentQuestion.id, answerId)
          }
        />
      </div>

      <div className="flex items-center justify-between gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={goBack}
          disabled={step === 0}
        >
          Previous
        </Button>
        <Button
          type="button"
          onClick={isCurrentChecked ? advance : submitCurrent}
          disabled={primaryDisabled}
          title={
            primaryDisabled
              ? "Pick at least one answer first"
              : undefined
          }
        >
          {primaryLabel}
        </Button>
      </div>
    </div>
  );
}

interface QuestionBodyProps {
  question: tUserQuizQuestion;
  selectedIds: Set<string>;
  revealed: boolean;
  onSingleChange: (answerId: string) => void;
  onMultipleChange: (answerId: string) => void;
}

function QuestionBody({
  question,
  selectedIds,
  revealed,
  onSingleChange,
  onMultipleChange,
}: QuestionBodyProps) {
  if (question.type === "SINGLE") {
    return (
      <SingleQuestionBody
        question={question}
        selectedIds={selectedIds}
        revealed={revealed}
        onSingleChange={onSingleChange}
      />
    );
  }
  return (
    <MultipleQuestionBody
      question={question}
      selectedIds={selectedIds}
      revealed={revealed}
      onMultipleChange={onMultipleChange}
    />
  );
}

interface SingleBodyProps {
  question: tUserQuizQuestion;
  selectedIds: Set<string>;
  revealed: boolean;
  onSingleChange: (answerId: string) => void;
}

function SingleQuestionBody({
  question,
  selectedIds,
  revealed,
  onSingleChange,
}: SingleBodyProps) {
  const value: string =
    selectedIds.size > 0 ? Array.from(selectedIds)[0] : "";

  return (
    <RadioGroup
      value={value}
      onValueChange={(next) => onSingleChange(String(next))}
    >
      <ul className="flex flex-col gap-2">
        {question.answers.map((answer) => (
          <AnswerOption
            key={answer.id}
            answer={answer}
            isSelected={selectedIds.has(answer.id)}
            revealed={revealed}
            marker={
              <RadioGroupItem
                value={answer.id}
                disabled={revealed}
                aria-label={`Select answer`}
              />
            }
          />
        ))}
      </ul>
    </RadioGroup>
  );
}

interface MultipleBodyProps {
  question: tUserQuizQuestion;
  selectedIds: Set<string>;
  revealed: boolean;
  onMultipleChange: (answerId: string) => void;
}

function MultipleQuestionBody({
  question,
  selectedIds,
  revealed,
  onMultipleChange,
}: MultipleBodyProps) {
  return (
    <ul className="flex flex-col gap-2">
      {question.answers.map((answer) => {
        const checked = selectedIds.has(answer.id);
        return (
          <AnswerOption
            key={answer.id}
            answer={answer}
            isSelected={checked}
            revealed={revealed}
            marker={
              <Checkbox
                checked={checked}
                disabled={revealed}
                onCheckedChange={() => onMultipleChange(answer.id)}
                aria-label={`Toggle answer`}
              />
            }
          />
        );
      })}
    </ul>
  );
}

interface AnswerOptionProps {
  answer: tUserQuizAnswer;
  isSelected: boolean;
  revealed: boolean;
  marker: React.ReactNode;
}

function AnswerOption({
  answer,
  isSelected,
  revealed,
  marker,
}: AnswerOptionProps) {
  const showAsCorrect = revealed && answer.isCorrect;
  const showAsWrong = revealed && isSelected && !answer.isCorrect;
  const showExplanation =
    revealed && answer.explanation && (showAsCorrect || showAsWrong);

  return (
    <li
      className={cn(
        "flex flex-col gap-2 rounded-md border border-border bg-background px-3 py-2",
        showAsCorrect &&
          "border-green-500/60 bg-green-50/60 dark:bg-green-950/20",
        showAsWrong && "border-red-500/60 bg-red-50/60 dark:bg-red-950/20",
      )}
    >
      <div className="flex items-start gap-3">
        <div className="flex h-9 items-center">{marker}</div>
        <span className="flex-1 text-sm">{answer.text}</span>
        {revealed && answer.isCorrect && (
          <CheckCircle2Icon className="mt-1 size-5 shrink-0 text-green-600 dark:text-green-400" />
        )}
        {showAsWrong && (
          <XCircleIcon className="mt-1 size-5 shrink-0 text-red-600 dark:text-red-400" />
        )}
      </div>
      {showExplanation && (
        <p className="ml-9 text-xs leading-relaxed text-muted-foreground">
          {answer.explanation}
        </p>
      )}
    </li>
  );
}
