"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card } from "../../components/ui/card";

interface WeekData {
  week: string;
  minutes: number;
}

interface CardioChartProps {
  data: WeekData[];
}

export function CardioChart({ data }: CardioChartProps) {
  if (data.length === 0) {
    return (
      <Card className="p-4 bg-card border-border">
        <h3 className="text-sm font-medium mb-2">Zone 2 Weekly Minutes</h3>
        <p className="text-xs text-muted-foreground text-center py-6">
          No cardio sessions logged yet.
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-4 bg-card border-border">
      <h3 className="text-sm font-medium mb-3">Zone 2 Weekly Minutes</h3>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={data}>
          <XAxis
            dataKey="week"
            tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
            tickLine={false}
            axisLine={false}
            width={40}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: "8px",
              fontSize: 12,
            }}
            formatter={(value) => [`${value} min`, "Zone 2"]}
          />
          <Bar
            dataKey="minutes"
            fill="var(--bucket-zone2)"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}
