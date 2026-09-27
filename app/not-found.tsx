import { NotFoundView } from "@/components/general/NotFoundView";

export default function NotFound() {
  return (
    <NotFoundView
      className="min-h-svh"
      title="Page not found"
      description="The page you're looking for doesn't exist, has moved, or is no longer available."
      backHref="/"
      backLabel="Back to home"
    />
  );
}
