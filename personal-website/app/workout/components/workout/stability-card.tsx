"use client";

import { useState, useEffect, useRef } from "react";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Play, Pause, Check } from "lucide-react";
import { useActiveWorkout } from "../../stores/active-workout";
import { getExerciseById } from "../../lib/engine/exercise-bank";

interface StabilityCardProps {
  exerciseIndex: number;
}

export function StabilityCard({ exerciseIndex }: StabilityCardProps) {
  const exercise = useActiveWorkout((s) => s.exercises[exerciseIndex]);
  const updateSet = useActiveWorkout((s) => s.updateSet);
  const completeSet = useActiveWorkout((s) => s.completeSet);

  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    if (!running) return;
    startTimeRef.current = Date.now() - elapsed * 1000;
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTimeRef.current!) / 1000));
    }, 200);
    return () => clearInterval(interval);
  }, [running]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!exercise) return null;

  const exerciseData = getExerciseById(exercise.exerciseId);
  if (!exerciseData) return null;

  const set = exercise.sets[0];
  const isCompleted = set?.completed ?? false;

  const handleQuickComplete = () => {
    updateSet(exerciseIndex, 0, { duration: elapsed || 60, completed: true });
    completeSet(exerciseIndex, 0);
    setRunning(false);
  };

  return (
    <Card className="p-4 bg-card border-border">
      <div className="mb-3">
        <h3 className="font-semibold">{exerciseData.name}</h3>
        <p className="text-xs text-muted-foreground">
          {exercise.targetReps}
        </p>
        {exerciseData.notes && (
          <p className="text-[11px] text-muted-foreground/70 mt-1">{exerciseData.notes}</p>
        )}
      </div>

      <div className="flex items-center justify-between">
        {/* Optional timer for timed holds */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setRunning(!running)}
            disabled={isCompleted}
          >
            {running ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
          </Button>
          <span className="text-sm tabular-nums text-muted-foreground">
            {Math.floor(elapsed / 60)}:{(elapsed % 60).toString().padStart(2, "0")}
          </span>
        </div>

        <Button
          size="sm"
          onClick={handleQuickComplete}
          disabled={isCompleted}
          className="gap-1"
        >
          <Check className="h-3.5 w-3.5" />
          {isCompleted ? "Done" : "Complete"}
        </Button>
      </div>
    </Card>
  );
}
