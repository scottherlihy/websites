"use client";

import { useState, useEffect, useRef } from "react";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Play, Pause, Check } from "lucide-react";
import { useActiveWorkout } from "../../stores/active-workout";
import { getExerciseById } from "../../lib/engine/exercise-bank";

interface CardioCardProps {
  exerciseIndex: number;
}

export function CardioCard({ exerciseIndex }: CardioCardProps) {
  const exercise = useActiveWorkout((s) => s.exercises[exerciseIndex]);
  const updateSet = useActiveWorkout((s) => s.updateSet);
  const completeSet = useActiveWorkout((s) => s.completeSet);

  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0); // seconds
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
  const minutes = Math.floor(elapsed / 60);
  const seconds = elapsed % 60;

  const handleComplete = () => {
    setRunning(false);
    updateSet(exerciseIndex, 0, { duration: elapsed });
    completeSet(exerciseIndex, 0);
  };

  return (
    <Card className="p-4 bg-card border-border">
      <div className="mb-4">
        <h3 className="font-semibold">{exerciseData.name}</h3>
        <p className="text-xs text-muted-foreground">
          Target: {exercise.targetReps} @ RPE {exercise.targetRpe}
        </p>
      </div>

      <div className="flex flex-col items-center gap-4">
        {/* Timer */}
        <div className="text-4xl font-bold tabular-nums">
          {minutes}:{seconds.toString().padStart(2, "0")}
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            size="lg"
            onClick={() => setRunning(!running)}
            disabled={set?.completed}
            className="gap-2"
          >
            {running ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            {running ? "Pause" : "Start"}
          </Button>
          <Button
            size="lg"
            onClick={handleComplete}
            disabled={set?.completed || elapsed === 0}
            className="gap-2"
          >
            <Check className="h-4 w-4" />
            Done
          </Button>
        </div>

        {/* HR input */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Avg HR:</span>
          <Input
            type="number"
            inputMode="numeric"
            value={set?.heartRate ?? ""}
            onChange={(e) =>
              updateSet(exerciseIndex, 0, {
                heartRate: e.target.value ? Number(e.target.value) : undefined,
              })
            }
            disabled={set?.completed}
            className="h-8 w-20 text-sm text-center"
            placeholder="bpm"
          />
        </div>
      </div>
    </Card>
  );
}
