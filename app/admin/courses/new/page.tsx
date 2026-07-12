import { buttonVariants } from "@/components/ui/button";
import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";
import { CreateCourseForm } from "./_components/CreateCourseForm";

export default function NewCoursePage() {
  return (
    <>
      <div className="mb-4 flex items-center gap-4">
        <Link
          href="/admin/courses"
          className={buttonVariants({ variant: "outline", size: "icon" })}
        >
          <ArrowLeftIcon size={16} />
        </Link>
        <h1 className="text-xl font-bold">Create New Course</h1>
      </div>

      <CreateCourseForm />
    </>
  );
}
