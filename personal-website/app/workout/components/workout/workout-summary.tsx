"use client";

import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { CheckCircle2, Clock, Dumbbell } from "lucide-react";
import { useActiveWorkout } from "../../stores/active-workout";
import { getExerciseById } from "../../lib/engine/exercise-bank";

interface WorkoutSummaryProps {
  onFinish: () => void;
}

export function WorkoutSummary({ onFinish }: WorkoutSummaryProps) {
  const exercises = useActiveWorkout((s) => s.exercises);
  const startTime = useActiveWorkout((s) => s.startTime);

  const duration = startTime ? Math.round((Date.now() - startTime) / 60000) : 0;

  // Calculate stats
  let totalSets = 0;
  let completedSets = 0;
  let totalVolume = 0;
  let exercisesCompleted = 0;

  for (const ex of exercises) {
    const anyCompleted = ex.sets.some((s) => s.completed);
    if (anyCompleted) exercisesCompleted++;

    for (const set of ex.sets) {
      totalSets++;
      if (set.completed) {
        completedSets++;
        if (set.weight && set.reps) {
          totalVolume += set.weight * set.reps;
        }
      }
    }
  }

  return (
    <Card className="p-6 bg-card border-border">
      <div className="text-center mb-6">
        <CheckCircle2 className="h-12 w-12 text-bucket-stability mx-auto mb-2" />
        <h2 className="text-xl font-bold">Workout Complete</h2>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center">
          <Clock className="h-5 w-5 text-muted-foreground mx-auto mb-1" />
          <p className="text-lg font-bold tabular-nums">{duration}</p>
          <p className="text-[10px] text-muted-foreground">minutes</p>
        </div>
        <div className="text-center">
          <Dumbbell className="h-5 w-5 text-muted-foreground mx-auto mb-1" />
          <p className="text-lg font-bold tabular-nums">{completedSets}/{totalSets}</p>
          <p className="text-[10px] text-muted-foreground">sets</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold tabular-nums mt-6">
            {totalVolume > 0 ? `${Math.round(totalVolume).toLocaleString()}` : "—"}
          </p>
          <p className="text-[10px] text-muted-foreground">kg volume</p>
        </div>
      </div>

      {/* Exercise breakdown */}
      <div className="space-y-1 mb-6">
        {exercises.map((ex) => {
          const data = getExerciseById(ex.exerciseId);
          const done = ex.sets.filter((s) => s.completed).length;
          return (
            <div key={ex.exerciseLogId} className="flex items-center justify-between text-sm">
              <span className={done > 0 ? "text-foreground" : "text-muted-foreground"}>
                {data?.name ?? ex.exerciseId}
              </span>
              <span className="text-xs text-muted-foreground tabular-nums">
                {done}/{ex.sets.length} sets
              </span>
            </div>
          );
        })}
      </div>

      <Button onClick={onFinish} className="w-full" size="lg">
        Save & Finish
      </Button>
    </Card>
  );
}
