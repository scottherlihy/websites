"use client";

import type { BucketProgress } from "../../types/tracking";

const BUCKET_COLORS: Record<string, string> = {
  zone2_cardio: "var(--bucket-zone2)",
  vo2max_intervals: "var(--bucket-vo2max)",
  strength_push: "var(--bucket-push)",
  strength_pull: "var(--bucket-pull)",
  strength_lower: "var(--bucket-lower)",
  power: "var(--bucket-power)",
  stability_mobility: "var(--bucket-stability)",
  rest_days: "var(--bucket-rest)",
};

const SHORT_LABELS: Record<string, string> = {
  zone2_cardio: "Zone 2",
  vo2max_intervals: "VO2max",
  strength_push: "Push",
  strength_pull: "Pull",
  strength_lower: "Lower",
  power: "Power",
  stability_mobility: "Stability",
  rest_days: "Rest",
};

interface BucketProgressRingProps {
  progress: BucketProgress;
  size?: number;
}

export function BucketProgressRing({ progress, size = 80 }: BucketProgressRingProps) {
  const strokeWidth = 5;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const fillPercent = Math.min(progress.percentage, 100);
  const dashOffset = circumference - (fillPercent / 100) * circumference;
  const color = BUCKET_COLORS[progress.bucket] ?? "var(--muted-foreground)";
  const label = SHORT_LABELS[progress.bucket] ?? progress.label;

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          {/* Background track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="var(--muted)"
            strokeWidth={strokeWidth}
          />
          {/* Progress arc */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            style={{ transition: "stroke-dashoffset 0.5s ease" }}
          />
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-semibold tabular-nums">
            {fillPercent}%
          </span>
        </div>
      </div>
      <span className="text-[11px] text-muted-foreground">{label}</span>
      <span className="text-[10px] text-muted-foreground/60">
        {progress.current}/{progress.target} {progress.unit}
      </span>
      {progress.weeklySets != null && progress.weeklySetTarget != null && (
        <span
          className={`text-[10px] tabular-nums ${
            progress.weeklySets >= progress.weeklySetTarget
              ? "text-bucket-stability"
              : "text-muted-foreground/60"
          }`}
        >
          {progress.weeklySets}/{progress.weeklySetTarget} sets
        </span>
      )}
    </div>
  );
}
