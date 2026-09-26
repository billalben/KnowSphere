import { auth } from "@/lib/auth";
import { safeRedirect } from "@/lib/safe-redirect";
import { LoginForm } from "./_components/LoginForm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

interface LoginPageProps {
  searchParams: Promise<{ redirect?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { redirect: rawRedirect } = await searchParams;
  const redirectTo = safeRedirect(rawRedirect);

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session) {
    return redirect(redirectTo);
  }

  return <LoginForm redirectTo={redirectTo} />;
}
