"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card } from "../../components/ui/card";
import type { BodyMetric } from "../../types/tracking";

interface BodyMetricsChartProps {
  metrics: BodyMetric[];
}

export function BodyMetricsChart({ metrics }: BodyMetricsChartProps) {
  if (metrics.length === 0) {
    return (
      <Card className="p-4 bg-card border-border">
        <h3 className="text-sm font-medium mb-2">Body Metrics</h3>
        <p className="text-xs text-muted-foreground text-center py-6">
          No body metrics logged yet.
        </p>
      </Card>
    );
  }

  const data = metrics
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((m) => ({
      date: m.date.slice(5), // MM-DD
      weight: m.weight,
      restingHR: m.restingHR,
    }));

  return (
    <Card className="p-4 bg-card border-border">
      <h3 className="text-sm font-medium mb-3">Body Metrics</h3>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data}>
          <XAxis
            dataKey="date"
            tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            yAxisId="weight"
            tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
            tickLine={false}
            axisLine={false}
            width={35}
          />
          <YAxis
            yAxisId="hr"
            orientation="right"
            tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
            tickLine={false}
            axisLine={false}
            width={35}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: "8px",
              fontSize: 12,
            }}
          />
          <Legend
            wrapperStyle={{ fontSize: 10 }}
          />
          <Line
            yAxisId="weight"
            type="monotone"
            dataKey="weight"
            stroke="var(--bucket-lower)"
            strokeWidth={2}
            dot={{ r: 2 }}
            name="Weight (kg)"
            connectNulls
          />
          <Line
            yAxisId="hr"
            type="monotone"
            dataKey="restingHR"
            stroke="var(--bucket-power)"
            strokeWidth={2}
            dot={{ r: 2 }}
            name="RHR (bpm)"
            connectNulls
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
}
