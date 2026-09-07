import "server-only";

import type { Quiz, QuizQuestionType } from "@/lib/generated/prisma/client";

import { buildChanges, type FieldDescriptor } from "../changes";

export type QuizAuditSnapshot = {
  id: string;
  questionsCount: number;
  questionTypes: QuizQuestionType[];
};

export type QuizRowInput = Pick<Quiz, "id"> & {
  questions?: { type: QuizQuestionType }[];
};

export function snapshotQuiz(row: QuizRowInput): QuizAuditSnapshot {
  const types = (row.questions ?? []).map((q) => q.type);
  return {
    id: row.id,
    questionsCount: types.length,
    questionTypes: [...types].sort(),
  };
}

export const QUIZ_AUDIT_FIELDS: ReadonlyArray<FieldDescriptor<QuizAuditSnapshot>> = [
  { key: "questionsCount", label: "questions", pick: (r) => r.questionsCount },
  {
    key: "questionTypes",
    label: "question types",
    pick: (r) => r.questionTypes,
  },
];

export function buildQuizFieldChanges(
  before: QuizAuditSnapshot,
  after: QuizAuditSnapshot,
): Record<string, { from: unknown; to: unknown }> {
  const changes = buildChanges(before, after, QUIZ_AUDIT_FIELDS);
  const out: Record<string, { from: unknown; to: unknown }> = {};
  for (const [key, change] of Object.entries(changes)) {
    if (change.kind === "scalar") {
      out[key] = { from: change.from, to: change.to };
    } else if (change.kind === "array") {
      out[key] = {
        from: change.removed.length > 0 ? `−${change.removed.join(", ")}` : "—",
        to: change.added.length > 0 ? `+${change.added.join(", ")}` : "—",
      };
    }
  }
  return out;
}
