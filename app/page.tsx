"use client";

import { ModeToggle } from "@/components/ModeToggle";
import { Button, buttonVariants } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import Link from "next/link";
import { toast } from "sonner";

export default function Page() {
  const {
    data: session,
    isPending, //loading state
    error, //error object
    refetch, //refetch the session
  } = authClient.useSession();

  const logout = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          toast.success("Successfully logged out!");
          refetch();
        },
      },
    });
  };

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div>
      <div>
        <ModeToggle />
      </div>

      {session ? (
        <div>
          <h1>Welcome, {session.user.name}!</h1>
          <p>You are logged in.</p>
          <Button onClick={logout} disabled={isPending}>
            Logout
          </Button>
        </div>
      ) : (
        <div>
          <h1>Please log in</h1>
          <p>You are not logged in.</p>
          <Link href="/login" className={buttonVariants()}>
            Login
          </Link>
        </div>
      )}
    </div>
  );
}
