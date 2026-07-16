import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";

export default function NotAdminPage() {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <div className="flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold">
          You are not authorized to access this page.
        </h1>
        <p className="text-sm text-gray-500">
          Please contact support if you believe this is an error.
        </p>

        <Link
          href="/"
          className={buttonVariants({
            className: "mt-4",
          })}
        >
          Go back to the home page
        </Link>
      </div>
    </div>
  );
}
