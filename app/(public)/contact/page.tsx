import { type Metadata } from "next";
import { MailIcon, ShieldCheckIcon, TimerIcon } from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getOptionalSession } from "../_lib/get-optional-session";

import { ContactForm } from "./_components/ContactForm";

export const metadata: Metadata = {
  title: "Contact | KnowSphere",
  description:
    "Get in touch with the KnowSphere team. Questions about a course, your account, or anything else? Send us a message.",
};

const SUPPORT_EMAIL = "support@knowsphere.app";

export default async function ContactPage() {
  const session = await getOptionalSession();
  const defaultName = session?.user?.name ?? "";
  const defaultEmail = session?.user?.email ?? "";

  return (
    <div className="pt-24 lg:pt-32 pb-12 lg:pb-16">
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
        <div className="space-y-8">
          <div className="space-y-4">
            <p className="text-sm font-medium uppercase tracking-wider text-primary">
              Contact
            </p>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              Get in touch.
            </h1>
            <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
              Questions about a tutorial, the starter kit, or the course? Send a
              message and a human will reply, usually within a day or two.
            </p>
          </div>

          <Separator />

          <div className="space-y-3">
            <p className="text-sm font-medium">Prefer plain email?</p>
            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              className="inline-flex items-center gap-2 text-base font-medium text-foreground underline-offset-4 hover:underline"
            >
              <MailIcon className="size-4 text-primary" />
              {SUPPORT_EMAIL}
            </a>
            <p className="text-sm text-muted-foreground">
              It lands in the same inbox.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 pt-2 sm:grid-cols-2">
            <div className="flex items-start gap-3 rounded-lg border bg-muted/30 p-4">
              <TimerIcon className="mt-0.5 size-4 text-primary" />
              <div className="space-y-0.5">
                <p className="text-sm font-medium">Quick replies</p>
                <p className="text-xs text-muted-foreground">
                  Usually within 1&ndash;2 business days
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-lg border bg-muted/30 p-4">
              <ShieldCheckIcon className="mt-0.5 size-4 text-primary" />
              <div className="space-y-0.5">
                <p className="text-sm font-medium">Private & secure</p>
                <p className="text-xs text-muted-foreground">
                  Your details stay between us
                </p>
              </div>
            </div>
          </div>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Send a message</CardTitle>
            </CardHeader>
            <CardContent>
              <ContactForm
                defaultName={defaultName}
                defaultEmail={defaultEmail}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
