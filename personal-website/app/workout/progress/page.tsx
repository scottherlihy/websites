"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { StrengthChart } from "../components/progress/strength-chart";
import { CardioChart } from "../components/progress/cardio-chart";
import { BenchmarkGrid } from "../components/progress/benchmark-grid";
import { BodyMetricsChart } from "../components/progress/body-metrics-chart";
import { useWorkouts, useBodyMetrics, useBenchmarkTests } from "../lib/db/hooks";
import { db } from "../lib/db/schema";
import { useLiveQuery } from "dexie-react-hooks";
import { getExerciseById } from "../lib/engine/exercise-bank";

export default function ProgressPage() {
  const workouts = useWorkouts();
  const bodyMetrics = useBodyMetrics();
  const benchmarkTests = useBenchmarkTests();

  // Build strength chart data: volume load per workout
  const strengthData = useLiveQuery(async () => {
    const completed = workouts.filter((w) => w.status === "completed");
    const points: Array<{ date: string; value: number }> = [];

    for (const w of completed.slice(-20)) {
      const logs = await db.exerciseLogs
        .where("workoutId")
        .equals(String(w.id))
        .toArray();
      const logIds = logs.map((l) => String(l.id));
      const sets =
        logIds.length > 0
          ? await db.sets.where("exerciseLogId").anyOf(logIds).toArray()
          : [];

      let volume = 0;
      for (const s of sets) {
        if (s.completed && s.weight && s.reps) {
          volume += s.weight * s.reps;
        }
      }

      if (volume > 0) {
        points.push({
          date: w.date.slice(5),
          value: Math.round(volume),
        });
      }
    }

    return points;
  }, [workouts]) ?? [];

  // Build cardio chart data: zone 2 minutes per week
  const cardioData = useLiveQuery(async () => {
    const completed = workouts.filter((w) => w.status === "completed");
    const weeklyMinutes = new Map<string, number>();

    for (const w of completed) {
      const weekKey = getWeekKey(w.date);
      const logs = await db.exerciseLogs
        .where("workoutId")
        .equals(String(w.id))
        .toArray();

      for (const log of logs) {
        const exercise = getExerciseById(log.exerciseId);
        if (!exercise?.bucket.includes("zone2_cardio")) continue;

        const sets = await db.sets
          .where("exerciseLogId")
          .equals(String(log.id))
          .toArray();

        for (const s of sets) {
          if (s.completed && s.duration) {
            weeklyMinutes.set(
              weekKey,
              (weeklyMinutes.get(weekKey) ?? 0) + s.duration / 60
            );
          }
        }
      }
    }

    return Array.from(weeklyMinutes.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-8)
      .map(([week, minutes]) => ({
        week,
        minutes: Math.round(minutes),
      }));
  }, [workouts]) ?? [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Progress</h1>

      <Tabs defaultValue="strength">
        <TabsList className="w-full">
          <TabsTrigger value="strength" className="flex-1 text-xs">Strength</TabsTrigger>
          <TabsTrigger value="cardio" className="flex-1 text-xs">Cardio</TabsTrigger>
          <TabsTrigger value="benchmarks" className="flex-1 text-xs">Benchmarks</TabsTrigger>
          <TabsTrigger value="body" className="flex-1 text-xs">Body</TabsTrigger>
        </TabsList>

        <TabsContent value="strength" className="mt-4">
          <StrengthChart
            title="Total Volume Load per Workout"
            data={strengthData}
            unit="kg"
            color="var(--bucket-push)"
          />
        </TabsContent>

        <TabsContent value="cardio" className="mt-4">
          <CardioChart data={cardioData} />
        </TabsContent>

        <TabsContent value="benchmarks" className="mt-4">
          <BenchmarkGrid tests={benchmarkTests} />
        </TabsContent>

        <TabsContent value="body" className="mt-4">
          <BodyMetricsChart metrics={bodyMetrics} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function getWeekKey(date: string): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  return d.toISOString().split("T")[0].slice(5);
}
