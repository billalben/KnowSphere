import { NotFoundView } from "@/components/general/NotFoundView";

export default function AdminNotFound() {
  return (
    <NotFoundView
      title="Not found"
      description="This record doesn't exist or may have been deleted."
      backHref="/admin/courses"
      backLabel="Back to courses"
    />
  );
}
