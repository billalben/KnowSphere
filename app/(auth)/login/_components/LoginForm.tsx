"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";
import { GithubIcon, LoaderIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

export function LoginForm() {
  const router = useRouter();

  const [githubPending, startGitHubTransition] = useTransition();
  const [emailPending, startEmailTransition] = useTransition();
  const [email, setEmail] = useState("");

  async function signInWithGitHub() {
    startGitHubTransition(async () => {
      await authClient.signIn.social({
        provider: "github",
        callbackURL: "/",
        fetchOptions: {
          onSuccess: () => {
            toast.success("Successfully logged in!");
          },
          onError: (error) => {
            console.error("Error logging in with GitHub:", error);

            toast.error(`Error logging in: ${error.error.message}`);
          },
        },
      });
    });
  }

  function signInWithEmail() {
    startEmailTransition(async () => {
      await authClient.emailOtp.sendVerificationOtp({
        email,
        type: "sign-in",
        fetchOptions: {
          onSuccess: () => {
            toast.success("OTP sent to your email!");
            router.push(`verify-request?email=${encodeURIComponent(email)}`);
          },
          onError: (error) => {
            console.error("Error sending OTP:", error);
            toast.error(`Error sending OTP: ${error.error.message}`);
          },
        },
      });
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Welcome Back</CardTitle>
        <CardDescription>
          Please login with your GitHub account to continue.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Button
          className="w-full"
          variant="outline"
          onClick={signInWithGitHub}
          disabled={githubPending}
        >
          {githubPending ? (
            <>
              <LoaderIcon size={16} className="animate-spin" />
              Loading...
            </>
          ) : (
            <>
              <GithubIcon size={16} />
              Login with GitHub
            </>
          )}
        </Button>

        <div
          className="my-3 relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0
            after:flex after:items-center after:border-t after:border-border"
        >
          <span className="relative z-10 bg-card px-2 text-muted-foreground">
            or continue with
          </span>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <Button
            className="w-full"
            onClick={signInWithEmail}
            disabled={emailPending || !email}
          >
            {emailPending ? (
              <>
                <LoaderIcon size={16} className="animate-spin" />
                Sending...
              </>
            ) : (
              <>Send OTP</>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
