import { adminGetAnalytics } from "@/app/data/admin/admin-get-analytics";

import { AnalyticsDashboard } from "./_components/analytics/AnalyticsDashboard";

export default async function AdminAnalyticsPage() {
  const data = await adminGetAnalytics();

  return <AnalyticsDashboard data={data} />;
}
