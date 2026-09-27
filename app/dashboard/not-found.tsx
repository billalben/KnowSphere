import { NotFoundView } from "@/components/general/NotFoundView";

export default function DashboardNotFound() {
  return (
    <NotFoundView
      title="Not found"
      description="This course, lesson, or page doesn't exist, or you may no longer have access to it."
      backHref="/dashboard"
      backLabel="Back to dashboard"
    />
  );
}
