"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { authClient } from "@/lib/auth-client";
import { LoaderIcon } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState, useTransition } from "react";
import { toast } from "sonner";

function VerifyEmailContent() {
  const [otp, setOtp] = useState("");
  const [emailPending, startEmailTransition] = useTransition();

  const router = useRouter();

  const params = useSearchParams();
  const email = params.get("email") || "";

  const isOtpValid = otp.length === 6;

  const verifyOtp = () => {
    startEmailTransition(async () => {
      await authClient.signIn.emailOtp({
        email,
        otp,
        fetchOptions: {
          onSuccess: () => {
            toast.success("Email verified successfully!");
            router.push("/");
          },
          onError: (error: { error: { message: string } }) => {
            console.error("Error verifying OTP:", error);
            toast.error(`Error verifying OTP: ${error.error.message}`);
          },
        },
      });
    });
  };

  return (
    <Card className="w-full mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-xl">Verify Your Email Address</CardTitle>
        <CardDescription>
          We have sent a verification code to your email address.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col justify-center items-center gap-4">
          <InputOTP value={otp} onChange={setOtp} maxLength={6} autoFocus>
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
            </InputOTPGroup>

            <InputOTPSeparator />

            <InputOTPGroup>
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>

          <p className="text-xs text-muted-foreground">
            Enter the 6-digit code sent to your email.
          </p>
        </div>

        <Button
          className="w-full mt-4"
          onClick={verifyOtp}
          disabled={emailPending || !isOtpValid}
        >
          {emailPending ? (
            <>
              <LoaderIcon size={16} className="animate-spin" />
              Verifying...
            </>
          ) : (
            "Verify Email"
          )}
        </Button>
      </CardContent>
    </Card>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center">
          <LoaderIcon className="animate-spin" />
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
