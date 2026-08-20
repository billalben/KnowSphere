import type { tAnalytics } from "@/app/data/admin/admin-get-analytics";

import { EnrollmentTrendChart } from "./EnrollmentTrendChart";
import { RecentCourses } from "./RecentCourses";
import { StatsGrid } from "./StatsGrid";

interface AnalyticsDashboardProps {
  data: tAnalytics;
}

export function AnalyticsDashboard({ data }: AnalyticsDashboardProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
        <p className="text-sm text-muted-foreground">
          An overview of your platform&apos;s activity over the last 30 days.
        </p>
      </div>

      <StatsGrid data={data.stats} sparklines={data.sparklines} />

      <EnrollmentTrendChart data={data.enrollmentTrend} />

      <RecentCourses courses={data.recentCourses} />
    </div>
  );
}
