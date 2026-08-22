import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { tUserLessonQuiz } from "@/app/data/user/get-lesson-quiz";

import { QuizPlayer } from "./QuizPlayer";

interface LessonQuizSectionProps {
  quiz: tUserLessonQuiz;
}

export function LessonQuizSection({ quiz }: LessonQuizSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quiz</CardTitle>
        <CardDescription>
          Test what you just learned. Optional — feel free to skip and still
          complete the lesson.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <QuizPlayer quiz={quiz} />
      </CardContent>
    </Card>
  );
}
