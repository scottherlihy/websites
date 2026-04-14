import type { Bucket } from "../../types/exercise";
import type { Workout, WorkoutExercise, SetLog } from "../../types/workout";
import type { BucketProgress, WeeklyBucketProgress } from "../../types/tracking";
import { getExerciseById, getWeeklyGoals } from "./exercise-bank";

const BUCKET_LABELS: Record<Bucket, string> = {
  zone2_cardio: "Zone 2 Cardio",
  vo2max_intervals: "VO2max Intervals",
  strength_push: "Strength: Push",
  strength_pull: "Strength: Pull",
  strength_lower: "Strength: Lower",
  power: "Power",
  stability_mobility: "Stability & Mobility",
  rest_days: "Rest Days",
};

const ALL_BUCKETS: Bucket[] = [
  "zone2_cardio",
  "vo2max_intervals",
  "strength_push",
  "strength_pull",
  "strength_lower",
  "power",
  "stability_mobility",
  "rest_days",
];

// Research-based minimum weekly set targets per bucket
// Deep research report: 12–16 sets for 4-day, 15–20 for 5-day
// Attia blueprint: ~15-18 sets per movement pattern across sessions
const WEEKLY_SET_TARGETS: Partial<Record<Bucket, number>> = {
  strength_push: 10,
  strength_pull: 10,
  strength_lower: 10,
  power: 4,
};

/**
 * Calculate weekly bucket fill levels from logged workouts.
 *
 * Tracking per bucket:
 * - zone2_cardio: sum of duration in minutes
 * - vo2max_intervals: count of completed sessions
 * - strength_push/pull/lower: exposures (workouts) + weekly sets + volume
 * - power: exposures + weekly sets
 * - stability_mobility: sum of minutes
 * - rest_days: count of rest day workouts
 */
export function calculateWeeklyProgress(
  workouts: Workout[],
  exerciseLogs: WorkoutExercise[],
  sets: SetLog[]
): WeeklyBucketProgress {
  const goals = getWeeklyGoals();
  const logsByWorkout = groupBy(exerciseLogs, "workoutId");
  const setsByLog = groupBy(sets, "exerciseLogId");

  // Exposure counts (workouts per bucket)
  const bucketCounts: Record<Bucket, number> = {
    zone2_cardio: 0, vo2max_intervals: 0, strength_push: 0,
    strength_pull: 0, strength_lower: 0, power: 0,
    stability_mobility: 0, rest_days: 0,
  };

  // Volume tracking: completed sets and total load per bucket
  const bucketSets: Record<Bucket, number> = {
    zone2_cardio: 0, vo2max_intervals: 0, strength_push: 0,
    strength_pull: 0, strength_lower: 0, power: 0,
    stability_mobility: 0, rest_days: 0,
  };
  const bucketVolume: Record<Bucket, number> = {
    zone2_cardio: 0, vo2max_intervals: 0, strength_push: 0,
    strength_pull: 0, strength_lower: 0, power: 0,
    stability_mobility: 0, rest_days: 0,
  };

  for (const workout of workouts) {
    if (workout.bucketsFilled.includes("rest_days")) {
      bucketCounts.rest_days++;
      continue;
    }

    const logs = logsByWorkout[String(workout.id)] ?? [];
    const workoutBuckets = new Set<Bucket>();

    for (const log of logs) {
      const exercise = getExerciseById(log.exerciseId);
      if (!exercise) continue;

      const logSets = setsByLog[String(log.id)] ?? [];
      const completedSets = logSets.filter((s) => s.completed);
      const hasCompletedSets = completedSets.length > 0;

      if (!hasCompletedSets && exercise.training_pillar !== "stability_mobility") continue;

      for (const bucket of exercise.bucket) {
        if (bucket === "zone2_cardio") {
          const totalDuration = logSets.reduce(
            (sum, s) => sum + (s.duration ?? 0), 0
          );
          bucketCounts.zone2_cardio += totalDuration / 60;
        } else if (bucket === "stability_mobility") {
          const totalDuration = logSets.reduce(
            (sum, s) => sum + (s.duration ?? 0), 0
          );
          bucketCounts.stability_mobility += totalDuration / 60;
        } else {
          workoutBuckets.add(bucket);

          // Count completed sets and volume for this exercise toward its bucket
          bucketSets[bucket] += completedSets.length;
          for (const s of completedSets) {
            if (s.weight && s.reps) {
              bucketVolume[bucket] += s.weight * s.reps;
            }
          }
        }
      }
    }

    // 1 exposure per workout per bucket
    for (const bucket of workoutBuckets) {
      bucketCounts[bucket]++;
    }
  }

  const progress = {} as WeeklyBucketProgress;

  for (const bucket of ALL_BUCKETS) {
    const goal = goals[bucket === "rest_days" ? "rest_days" : bucket];
    const target = getTarget(bucket, goal);
    const current = bucketCounts[bucket];
    const setTarget = WEEKLY_SET_TARGETS[bucket];

    progress[bucket] = {
      bucket,
      label: BUCKET_LABELS[bucket],
      current: Math.round(current * 10) / 10,
      target,
      unit: goal?.unit ?? "sessions",
      percentage: target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0,
      weeklySets: setTarget != null ? bucketSets[bucket] : undefined,
      weeklyVolume: setTarget != null ? Math.round(bucketVolume[bucket]) : undefined,
      weeklySetTarget: setTarget,
    };
  }

  return progress;
}

function getTarget(
  bucket: Bucket,
  goal: ReturnType<typeof getWeeklyGoals>[string] | undefined
): number {
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

function groupBy<T>(arr: T[], key: keyof T): Record<string, T[]> {
  const result: Record<string, T[]> = {};
  for (const item of arr) {
    const k = String(item[key]);
    (result[k] ??= []).push(item);
  }
  return result;
}
