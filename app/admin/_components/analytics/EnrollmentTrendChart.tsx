"use client";

import { CartesianGrid, Area, AreaChart, XAxis, YAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

import type { tAnalyticsDailyPoint } from "@/app/data/admin/admin-get-analytics";

interface EnrollmentTrendChartProps {
  data: tAnalyticsDailyPoint[];
}

const config = {
  enrollments: {
    label: "Enrollments",
    color: "var(--color-chart-1)",
  },
  revenue: {
    label: "Revenue",
    color: "var(--color-chart-3)",
  },
} satisfies ChartConfig;

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
});

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

function formatDayLabel(value: string): string {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return dateFormatter.format(d);
}

export function EnrollmentTrendChart({ data }: EnrollmentTrendChartProps) {
  const hasData = data.some((d) => d.enrollments > 0 || d.revenue > 0);

  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle>Enrollments &amp; revenue</CardTitle>
        <CardDescription>
          Last 30 days &mdash; enrollments per day and revenue from active
          checkouts.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={config} className="aspect-auto! h-72 w-full">
          <AreaChart
            data={data}
            margin={{ top: 8, right: 8, bottom: 0, left: 0 }}
          >
            <defs>
              <linearGradient
                id="enrollment-trend-fill"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="0%"
                  stopColor="var(--color-chart-1)"
                  stopOpacity={0.35}
                />
                <stop
                  offset="100%"
                  stopColor="var(--color-chart-1)"
                  stopOpacity={0}
                />
              </linearGradient>
              <linearGradient
                id="revenue-trend-fill"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="0%"
                  stopColor="var(--color-chart-3)"
                  stopOpacity={0.25}
                />
                <stop
                  offset="100%"
                  stopColor="var(--color-chart-3)"
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={24}
              tickFormatter={formatDayLabel}
            />
            <YAxis
              yAxisId="left"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              width={32}
              allowDecimals={false}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              width={48}
              tickFormatter={(value: number) =>
                value >= 1000 ? `$${Math.round(value / 1000)}k` : `$${value}`
              }
            />

            <ChartTooltip
              cursor={{ stroke: "var(--color-border)", strokeDasharray: 3 }}
              content={
                <ChartTooltipContent
                  indicator="line"
                  labelFormatter={(value) => {
                    const d = new Date(String(value));
                    return Number.isNaN(d.getTime())
                      ? String(value)
                      : dateFormatter.format(d);
                  }}
                  formatter={(value, name, item) => {
                    const numeric = Number(value);
                    const formatted =
                      item.dataKey === "revenue"
                        ? currencyFormatter.format(numeric / 100)
                        : numeric.toLocaleString();
                    return (
                      <div className="flex flex-1 items-center justify-between gap-2 leading-none">
                        <span className="text-muted-foreground">
                          {item.dataKey === "revenue"
                            ? "Revenue"
                            : "Enrollments"}
                        </span>
                        <span className="font-mono font-medium tabular-nums text-foreground">
                          {formatted}
                        </span>
                      </div>
                    );
                  }}
                />
              }
            />

            <Area
              yAxisId="left"
              type="monotone"
              dataKey="enrollments"
              stroke="var(--color-chart-1)"
              strokeWidth={2}
              fill="url(#enrollment-trend-fill)"
              isAnimationActive={false}
            />
            <Area
              yAxisId="right"
              type="monotone"
              dataKey="revenue"
              stroke="var(--color-chart-3)"
              strokeWidth={2}
              fill="url(#revenue-trend-fill)"
              isAnimationActive={false}
            />
          </AreaChart>
        </ChartContainer>

        {!hasData ? (
          <p className="mt-4 text-center text-xs text-muted-foreground">
            No enrollments yet in the last 30 days.
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
