"use client";

import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Check, Plus } from "lucide-react";
import { useActiveWorkout } from "../../stores/active-workout";
import { getExerciseById } from "../../lib/engine/exercise-bank";

interface StrengthCardProps {
  exerciseIndex: number;
}

export function StrengthCard({ exerciseIndex }: StrengthCardProps) {
  const exercise = useActiveWorkout((s) => s.exercises[exerciseIndex]);
  const updateSet = useActiveWorkout((s) => s.updateSet);
  const completeSet = useActiveWorkout((s) => s.completeSet);
  const addSet = useActiveWorkout((s) => s.addSet);
  const startRestTimer = useActiveWorkout((s) => s.startRestTimer);

  if (!exercise) return null;

  const exerciseData = getExerciseById(exercise.exerciseId);
  if (!exerciseData) return null;

  const handleComplete = (setIndex: number) => {
    completeSet(exerciseIndex, setIndex);
    if (exercise.restSec > 0) {
      startRestTimer(exercise.restSec);
    }
  };

  return (
    <Card className="p-4 bg-card border-border">
      <div className="mb-3">
        <h3 className="font-semibold">{exerciseData.name}</h3>
        <p className="text-xs text-muted-foreground">
          Target: {exercise.targetSets} × {exercise.targetReps} @ RPE {exercise.targetRpe}
        </p>
        {exerciseData.notes && (
          <p className="text-[11px] text-muted-foreground/70 mt-1">{exerciseData.notes}</p>
        )}
      </div>

      {/* Column headers */}
      <div className="grid grid-cols-[2rem_1fr_1fr_1fr_2.5rem] gap-2 mb-1 px-1">
        <span className="text-[10px] text-muted-foreground">Set</span>
        <span className="text-[10px] text-muted-foreground">kg</span>
        <span className="text-[10px] text-muted-foreground">Reps</span>
        <span className="text-[10px] text-muted-foreground">RPE</span>
        <span />
      </div>

      {/* Set rows */}
      <div className="space-y-1.5">
        {exercise.sets.map((set, setIdx) => (
          <div
            key={setIdx}
            className={`grid grid-cols-[2rem_1fr_1fr_1fr_2.5rem] gap-2 items-center ${
              set.completed ? "opacity-50" : ""
            }`}
          >
            <span className="text-xs text-muted-foreground text-center">
              {set.setNumber}
            </span>
            <Input
              type="number"
              inputMode="decimal"
              value={set.weight ?? ""}
              onChange={(e) =>
                updateSet(exerciseIndex, setIdx, {
                  weight: e.target.value ? Number(e.target.value) : undefined,
                })
              }
              disabled={set.completed}
              className="h-8 text-sm text-center"
              placeholder="0"
            />
            <Input
              type="number"
              inputMode="numeric"
              value={set.reps ?? ""}
              onChange={(e) =>
                updateSet(exerciseIndex, setIdx, {
                  reps: e.target.value ? Number(e.target.value) : undefined,
                })
              }
              disabled={set.completed}
              className="h-8 text-sm text-center"
              placeholder="0"
            />
            <Input
              type="number"
              inputMode="decimal"
              value={set.rpe ?? ""}
              onChange={(e) =>
                updateSet(exerciseIndex, setIdx, {
                  rpe: e.target.value ? Number(e.target.value) : undefined,
                })
              }
              disabled={set.completed}
              className="h-8 text-sm text-center"
              placeholder="0"
            />
            <Button
              variant={set.completed ? "secondary" : "outline"}
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => handleComplete(setIdx)}
              disabled={set.completed}
            >
              <Check className="h-3.5 w-3.5" />
            </Button>
          </div>
        ))}
      </div>

      <Button
        variant="ghost"
        size="sm"
        className="mt-2 w-full text-xs gap-1"
        onClick={() => addSet(exerciseIndex)}
      >
        <Plus className="h-3 w-3" />
        Add Set
      </Button>
    </Card>
  );
}
