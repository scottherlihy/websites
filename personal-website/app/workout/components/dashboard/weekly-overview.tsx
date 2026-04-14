"use client";

import type { WeeklyBucketProgress } from "../../types/tracking";
import type { Bucket } from "../../types/exercise";
import { BucketProgressRing } from "./bucket-progress-ring";

const BUCKET_ORDER: Bucket[] = [
  "zone2_cardio",
  "vo2max_intervals",
  "strength_push",
  "strength_pull",
  "strength_lower",
  "power",
  "stability_mobility",
  "rest_days",
];

interface WeeklyOverviewProps {
  progress: WeeklyBucketProgress;
}

export function WeeklyOverview({ progress }: WeeklyOverviewProps) {
  return (
    <div className="grid grid-cols-4 gap-4">
      {BUCKET_ORDER.map((bucket) => (
        <BucketProgressRing key={bucket} progress={progress[bucket]} />
      ))}
    </div>
  );
}
