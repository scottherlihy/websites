"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card } from "../../components/ui/card";

interface DataPoint {
  date: string;
  value: number;
  label?: string;
}

interface StrengthChartProps {
  title: string;
  data: DataPoint[];
  unit: string;
  color?: string;
}

export function StrengthChart({
  title,
  data,
  unit,
  color = "var(--bucket-push)",
}: StrengthChartProps) {
  if (data.length === 0) {
    return (
      <Card className="p-4 bg-card border-border">
        <h3 className="text-sm font-medium mb-2">{title}</h3>
        <p className="text-xs text-muted-foreground text-center py-6">
          No data yet. Complete some workouts to see trends.
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-4 bg-card border-border">
      <h3 className="text-sm font-medium mb-3">{title}</h3>
      <ResponsiveContainer width="100%" height={180}>
        <LineChart data={data}>
          <XAxis
            dataKey="date"
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
            labelStyle={{ color: "var(--muted-foreground)" }}
            formatter={(value) => [`${value} ${unit}`, title]}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            dot={{ r: 3, fill: color }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
}
