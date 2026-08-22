import { LessonContentSkeleton } from "../_components/LessonContentSkeleton";
import { CommentsSkeleton } from "./_components/comments/CommentsSkeleton";

export default function LessonLoading() {
  return (
    <>
      <LessonContentSkeleton />
      <CommentsSkeleton />
    </>
  );
}
