"use client";

import { Area, AreaChart } from "recharts";

import {
  ChartContainer,
  type ChartConfig,
} from "@/components/ui/chart";

import type { tAnalyticsSparkPoint } from "@/app/data/admin/admin-get-analytics";

export type SparklineColor = "chart-1" | "chart-2" | "chart-3" | "chart-4";

interface SparklineProps {
  data: tAnalyticsSparkPoint[];
  color: SparklineColor;
  gradientId: string;
}

export function Sparkline({ data, color, gradientId }: SparklineProps) {
  const config = {
    value: {
      label: "Value",
      color: `var(--color-${color})`,
    },
  } satisfies ChartConfig;

  const stroke = `var(--color-${color})`;

  return (
    <ChartContainer
      config={config}
      className="!aspect-auto h-10 w-full"
    >
      <AreaChart
        data={data}
        margin={{ top: 2, right: 0, bottom: 0, left: 0 }}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={stroke} stopOpacity={0.35} />
            <stop offset="100%" stopColor={stroke} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey="value"
          stroke={stroke}
          strokeWidth={2}
          fill={`url(#${gradientId})`}
          isAnimationActive={false}
          dot={false}
        />
      </AreaChart>
    </ChartContainer>
  );
}
