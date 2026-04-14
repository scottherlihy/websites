"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { useCallback } from "react";
import { db } from "./schema";
import { localToday } from "../../lib/utils";
import type { Exercise } from "../../types/exercise";
import type { Workout, WorkoutExercise, SetLog } from "../../types/workout";
import type { BodyMetric, BenchmarkTest, UserConfig } from "../../types/tracking";

// ─── Workouts ────────────────────────────────────────────────

export function useWorkouts(dateRange?: { start: string; end: string }) {
  return useLiveQuery(() => {
    if (dateRange) {
      return db.workouts
        .where("date")
        .between(dateRange.start, dateRange.end, true, true)
        .reverse()
        .toArray();
    }
    return db.workouts.orderBy("date").reverse().toArray();
  }, [dateRange?.start, dateRange?.end]) ?? [];
}

export function useWorkout(id: string | undefined) {
  return useLiveQuery(
    () => (id ? db.workouts.get(id) : undefined),
    [id]
  );
}

export function useSaveWorkout() {
  return useCallback(async (workout: Omit<Workout, "id">) => {
    const id = await db.workouts.add(workout as Workout);
    return String(id);
  }, []);
}

export function useUpdateWorkout() {
  return useCallback(async (id: string, updates: Partial<Workout>) => {
    await db.workouts.update(id, updates);
  }, []);
}

// ─── Exercise Logs (per-workout) ─────────────────────────────

export function useExerciseLogs(workoutId: string | undefined) {
  return useLiveQuery(
    () =>
      workoutId
        ? db.exerciseLogs.where("workoutId").equals(workoutId).sortBy("order")
        : [],
    [workoutId]
  ) ?? [];
}

export function useSaveExerciseLogs() {
  return useCallback(async (logs: Omit<WorkoutExercise, "id">[]) => {
    await db.exerciseLogs.bulkAdd(logs as WorkoutExercise[]);
  }, []);
}

// ─── Sets ────────────────────────────────────────────────────

export function useSets(exerciseLogId: string | undefined) {
  return useLiveQuery(
    () =>
      exerciseLogId
        ? db.sets.where("exerciseLogId").equals(exerciseLogId).sortBy("setNumber")
        : [],
    [exerciseLogId]
  ) ?? [];
}

export function useSaveSets() {
  return useCallback(async (sets: Omit<SetLog, "id">[]) => {
    await db.sets.bulkAdd(sets as SetLog[]);
  }, []);
}

export function useUpdateSet() {
  return useCallback(async (id: string, updates: Partial<SetLog>) => {
    await db.sets.update(id, updates);
  }, []);
}

// ─── Exercise History (for pre-filling weights) ──────────────

export function useExerciseHistory(exerciseId: string | undefined, limit = 5) {
  return useLiveQuery(async () => {
    if (!exerciseId) return [];
    const logs = await db.exerciseLogs
      .where("exerciseId")
      .equals(exerciseId)
      .reverse()
      .limit(limit)
      .toArray();
    if (logs.length === 0) return [];
    const logIds = logs.map((l) => String(l.id));
    return db.sets
      .where("exerciseLogId")
      .anyOf(logIds)
      .toArray();
  }, [exerciseId, limit]) ?? [];
}

// ─── Bucket Progress (calculated from workout data) ──────────

export function useBucketProgress(weekStart: string) {
  return useLiveQuery(async () => {
    const weekEnd = getWeekEnd(weekStart);
    const workouts = await db.workouts
      .where("date")
      .between(weekStart, weekEnd, true, true)
      .toArray();

    const completedWorkouts = workouts.filter((w) => w.status === "completed");

    // Get all exercise logs and sets for these workouts
    const workoutIds = completedWorkouts.map((w) => String(w.id));
    const exerciseLogs = workoutIds.length > 0
      ? await db.exerciseLogs.where("workoutId").anyOf(workoutIds).toArray()
      : [];
    const logIds = exerciseLogs.map((l) => String(l.id));
    const sets = logIds.length > 0
      ? await db.sets.where("exerciseLogId").anyOf(logIds).toArray()
      : [];

    return { workouts: completedWorkouts, exerciseLogs, sets };
  }, [weekStart]);
}

function getWeekEnd(weekStart: string): string {
  const d = new Date(weekStart);
  d.setDate(d.getDate() + 6);
  return d.toISOString().split("T")[0];
}

// ─── Body Metrics ────────────────────────────────────────────

export function useBodyMetrics(dateRange?: { start: string; end: string }) {
  return useLiveQuery(() => {
    if (dateRange) {
      return db.bodyMetrics
        .where("date")
        .between(dateRange.start, dateRange.end, true, true)
        .toArray();
    }
    return db.bodyMetrics.orderBy("date").reverse().toArray();
  }, [dateRange?.start, dateRange?.end]) ?? [];
}

export function useSaveBodyMetric() {
  return useCallback(async (metric: Omit<BodyMetric, "id">) => {
    await db.bodyMetrics.add(metric as BodyMetric);
  }, []);
}

// ─── Benchmark Tests ─────────────────────────────────────────

export function useBenchmarkTests(benchmarkId?: string) {
  return useLiveQuery(() => {
    if (benchmarkId) {
      return db.benchmarkTests
        .where("benchmarkId")
        .equals(benchmarkId)
        .reverse()
        .toArray();
    }
    return db.benchmarkTests.orderBy("date").reverse().toArray();
  }, [benchmarkId]) ?? [];
}

export function useSaveBenchmarkTest() {
  return useCallback(async (test: Omit<BenchmarkTest, "id">) => {
    await db.benchmarkTests.add(test as BenchmarkTest);
  }, []);
}

// ─── User Config ─────────────────────────────────────────────

const DEFAULT_CONFIG: UserConfig = {
  startDate: localToday(),
  currentWeek: 1,
  equipment: [
    "barbell",
    "dumbbell",
    "kettlebell",
    "cable_machine",
    "bodyweight",
    "band",
    "cardio_machine",
  ],
  difficultyTier: "beginner",
};

export function useUserConfig() {
  const config = useLiveQuery(async () => {
    const configs = await db.userConfig.toArray();
    return configs[0];
  });
  return config ?? DEFAULT_CONFIG;
}

export function useUpdateUserConfig() {
  return useCallback(async (updates: Partial<UserConfig>) => {
    const configs = await db.userConfig.toArray();
    if (configs.length === 0) {
      await db.userConfig.add({ ...DEFAULT_CONFIG, ...updates } as UserConfig);
    } else {
      await db.userConfig.update(configs[0].id!, updates);
    }
  }, []);
}

// ─── Custom Exercises ────────────────────────────────────────

export function useCustomExercises() {
  return useLiveQuery(() => db.customExercises.toArray()) ?? [];
}

export function useSaveCustomExercise() {
  return useCallback(async (exercise: Exercise) => {
    await db.customExercises.put(exercise);
  }, []);
}

export function useDeleteCustomExercise() {
  return useCallback(async (id: string) => {
    await db.customExercises.delete(id);
  }, []);
}
