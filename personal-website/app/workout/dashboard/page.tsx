"use client";

import { WeeklyOverview } from "../components/dashboard/weekly-overview";
import { PeriodizationHeader } from "../components/dashboard/periodization-header";
import { TodaySuggestion } from "../components/dashboard/today-suggestion";
import { RecentWorkouts } from "../components/dashboard/recent-workouts";
import { WorkoutCalendar } from "../components/dashboard/workout-calendar";
import { Separator } from "../components/ui/separator";
import { useWorkouts, useBucketProgress, useUserConfig } from "../lib/db/hooks";
import { getCurrentPhase, getWeekStart } from "../lib/engine/periodization";
import { calculateWeeklyProgress } from "../lib/engine/bucket-tracker";
import { getWeeklyGoals } from "../lib/engine/exercise-bank";
import type { Bucket } from "../types/exercise";
import type { WeeklyBucketProgress, BucketProgress } from "../types/tracking";

function buildEmptyProgress(): WeeklyBucketProgress {
  const goals = getWeeklyGoals();
  const buckets: Bucket[] = [
    "zone2_cardio", "vo2max_intervals", "strength_push", "strength_pull",
    "strength_lower", "power", "stability_mobility", "rest_days",
  ];
  const progress = {} as WeeklyBucketProgress;
  for (const b of buckets) {
    const goal = goals[b];
    progress[b] = {
      bucket: b,
      label: goal?.label ?? b,
      current: 0,
      target: getTarget(b, goal),
      unit: goal?.unit ?? "sessions",
      percentage: 0,
    };
  }
  return progress;
}

function getTarget(bucket: Bucket, goal: ReturnType<typeof getWeeklyGoals>[string] | undefined): number {
  if (!goal) return 0;
  switch (bucket) {
    case "zone2_cardio": return goal.target_min ?? 150;
    case "vo2max_intervals": return goal.target_sessions ?? 1;
    case "strength_push":
    case "strength_pull":
    case "strength_lower": return goal.target_exposures ?? 2;
    case "power": return goal.target_exposures_min ?? 1;
    case "stability_mobility": return (goal.target_min_per_session ?? 10) * 7;
    case "rest_days": return goal.target_min ?? 2;
    default: return 0;
  }
}

export default function DashboardPage() {
  const config = useUserConfig();
  const weekStart = getWeekStart();
  const phase = getCurrentPhase(config.startDate);
  const bucketData = useBucketProgress(weekStart);
  const recentWorkouts = useWorkouts();

  // Calculate bucket progress from raw data, or show empty state
  const progress = bucketData
    ? calculateWeeklyProgress(bucketData.workouts, bucketData.exerciseLogs, bucketData.sets)
    : buildEmptyProgress();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Weekly Dashboard</h1>
        <div className="mt-2">
          <PeriodizationHeader phase={phase} />
        </div>
      </div>

      <WeeklyOverview progress={progress} />

      <Separator />

      <TodaySuggestion progress={progress} />

      <WorkoutCalendar workouts={recentWorkouts} />

      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Recent Workouts
        </h2>
        <RecentWorkouts workouts={recentWorkouts} />
      </div>
    </div>
  );
}
