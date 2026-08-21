import { ConstructionIcon, SettingsIcon } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata = {
  title: "Settings | KnowSphere",
};

export default function SettingsPage() {
  return (
    <div className="space-y-1">
      <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
      <p className="text-sm text-muted-foreground">
        Configure your learning preferences and notifications.
      </p>

      <Card className="mx-auto max-w-md">
        <CardHeader className="items-center text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-muted">
            <SettingsIcon
              className="size-6 text-muted-foreground"
              aria-hidden
            />
          </div>
          <CardTitle>Settings coming soon</CardTitle>
          <CardDescription>
            Notification preferences, playback speed, and other options will
            live here.
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
