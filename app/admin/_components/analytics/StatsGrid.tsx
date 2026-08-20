import {
  BookOpenIcon,
  DollarSignIcon,
  GraduationCapIcon,
  UsersIcon,
} from "lucide-react";

import type { tAnalytics } from "@/app/data/admin/admin-get-analytics";

import { StatCard } from "./StatCard";

const numberFormatter = new Intl.NumberFormat("en-US");
const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

interface StatsGridProps {
  data: tAnalytics["stats"];
  sparklines: tAnalytics["sparklines"];
}

export function StatsGrid({ data, sparklines }: StatsGridProps) {
  const cards = [
    {
      icon: UsersIcon,
      label: "Total users",
      value: numberFormatter.format(data.totalUsers),
      subtitle: `${numberFormatter.format(data.newUsersThisPeriod)} new this month`,
      data: sparklines.users,
      color: "chart-1" as const,
      gradientId: "sparkline-users",
    },
    {
      icon: BookOpenIcon,
      label: "Total courses",
      value: numberFormatter.format(data.totalCourses),
      subtitle: `${numberFormatter.format(data.publishedCourses)} published · ${numberFormatter.format(data.newCoursesThisPeriod)} new this month`,
      data: sparklines.courses,
      color: "chart-2" as const,
      gradientId: "sparkline-courses",
    },
    {
      icon: GraduationCapIcon,
      label: "Active enrollments",
      value: numberFormatter.format(data.activeEnrollments),
      subtitle: `${numberFormatter.format(data.pendingEnrollments)} pending · ${numberFormatter.format(data.newEnrollmentsThisPeriod)} new this month`,
      data: sparklines.enrollments,
      color: "chart-3" as const,
      gradientId: "sparkline-enrollments",
    },
    {
      icon: DollarSignIcon,
      label: "Total revenue",
      value: currencyFormatter.format(data.totalRevenueCents / 100),
      subtitle: `${currencyFormatter.format(data.newRevenueCentsThisPeriod / 100)} this month`,
      data: sparklines.revenue,
      color: "chart-4" as const,
      gradientId: "sparkline-revenue",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <StatCard key={card.label} {...card} />
      ))}
    </div>
  );
}
