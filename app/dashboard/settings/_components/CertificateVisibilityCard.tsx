"use client";

import { useState, useTransition } from "react";
import { EyeIcon, EyeOffIcon, Loader2Icon } from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { tryCatch } from "@/hooks/try-catch";

import { updateCertificateVisibilityAction } from "../actions";

interface CertificateVisibilityCardProps {
  initialValue: boolean;
}

export function CertificateVisibilityCard({
  initialValue,
}: CertificateVisibilityCardProps) {
  const [isPublic, setIsPublic] = useState(initialValue);
  const [isPending, startTransition] = useTransition();

  function handleChange(next: boolean) {
    const previous = isPublic;
    setIsPublic(next);

    startTransition(async () => {
      const { data: result, error } = await tryCatch(
        updateCertificateVisibilityAction({
          showCertificatesPublicly: next,
        }),
      );

      if (error || !result) {
        setIsPublic(previous);
        toast.error("Unexpected error. Please try again.");
        return;
      }

      if (result.status === "error") {
        setIsPublic(previous);
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          {isPublic ? (
            <EyeIcon className="size-4 text-primary" />
          ) : (
            <EyeOffIcon className="size-4 text-muted-foreground" />
          )}
          Certificate visibility
        </CardTitle>
        <CardDescription>
          When enabled, anyone with a certificate&apos;s public link can view it.
          When disabled, your certificates are private and their public URLs
          return &quot;not found.&quot;
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between gap-4 rounded-lg border bg-muted/30 p-4">
          <div className="space-y-0.5">
            <Label
              htmlFor="certificate-visibility"
              className="text-sm font-medium"
            >
              Show my certificates publicly
            </Label>
            <p className="text-xs text-muted-foreground">
              {isPublic
                ? "Your earned certificates can be shared and viewed by anyone."
                : "Your certificates are hidden from public view."}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {isPending ? (
              <Loader2Icon className="size-4 animate-spin text-muted-foreground" />
            ) : null}
            <Switch
              id="certificate-visibility"
              checked={isPublic}
              onCheckedChange={handleChange}
              disabled={isPending}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
