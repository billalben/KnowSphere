import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

import { Sparkline, type SparklineColor } from "./Sparkline";
import type { tAnalyticsSparkPoint } from "@/app/data/admin/admin-get-analytics";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  subtitle: string;
  data: tAnalyticsSparkPoint[];
  color: SparklineColor;
  gradientId: string;
  className?: string;
}

export function StatCard({
  icon: Icon,
  label,
  value,
  subtitle,
  data,
  color,
  gradientId,
  className,
}: StatCardProps) {
  return (
    <Card className={cn("relative overflow-hidden", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {label}
        </CardTitle>
        <Icon
          className="size-4 text-muted-foreground"
          aria-hidden
          strokeWidth={2}
        />
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-2xl font-bold tabular-nums tracking-tight">
          {value}
        </div>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
        <Sparkline data={data} color={color} gradientId={gradientId} />
      </CardContent>
    </Card>
  );
}
