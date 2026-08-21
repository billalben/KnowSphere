import { ConstructionIcon, UserIcon } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata = {
  title: "Profile | KnowSphere",
};

export default function ProfilePage() {
  return (
    <div className="space-y-1">
      <h2 className="text-2xl font-bold tracking-tight">Profile</h2>
      <p className="text-sm text-muted-foreground">
        Manage your account details and preferences.
      </p>

      <Card className="mx-auto max-w-md">
        <CardHeader className="items-center text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-muted">
            <UserIcon className="size-6 text-muted-foreground" aria-hidden />
          </div>
          <CardTitle>Profile coming soon</CardTitle>
          <CardDescription>
            You&apos;ll be able to update your name, email, and avatar from here.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center pb-8">
          <ConstructionIcon
            className="size-5 text-muted-foreground"
            aria-hidden
          />
        </CardContent>
      </Card>
    </div>
  );
}
