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
import { GithubIcon } from "lucide-react";

export default function LoginPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Welcome Back</CardTitle>
        <CardDescription>
          Please login with your GitHub account to continue.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Button className="w-full" variant="outline">
          <GithubIcon size={16} className="mr-2" />
          Login
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
            <Input id="email" type="email" placeholder="you@example.com" />
          </div>

          <Button className="w-full">Continue</Button>
        </div>
      </CardContent>
    </Card>
  );
}
