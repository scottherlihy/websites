"use client";

import { useState } from "react";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { ArrowLeftRight, Check, X, Plus, Copy } from "lucide-react";
import { getExerciseById, getDayTemplate } from "../../lib/engine/exercise-bank";
import type { GeneratedWorkout } from "../../lib/engine/workout-generator";
import type { WorkoutExercise } from "../../types/workout";

interface WorkoutPreviewProps {
  generated: GeneratedWorkout;
  onSwapExercise: (index: number) => void;
  onRemoveExercise: (index: number) => void;
  onAddExercise: (afterPhase?: string) => void;
  onStartWorkout: () => void;
  isHistorical?: boolean;
  onSaveAsCompleted?: () => void;
}

export function WorkoutPreview({
  generated,
  onSwapExercise,
  onRemoveExercise,
  onAddExercise,
  onStartWorkout,
  isHistorical,
  onSaveAsCompleted,
}: WorkoutPreviewProps) {
  const [copied, setCopied] = useState(false);
  const template = getDayTemplate(generated.workout.templateId);

  // Group exercises by phase
  const phases = new Map<string, Array<Omit<WorkoutExercise, "id" | "workoutId"> & { index: number }>>();
  generated.exercises.forEach((ex, idx) => {
    const phase = ex.templatePhase;
    if (!phases.has(phase)) phases.set(phase, []);
    phases.get(phase)!.push({ ...ex, index: idx });
  });

  const handleCopy = () => {
    const text = formatWorkoutForClipboard(generated);
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-semibold">{template?.label ?? "Workout"}</h2>
          <p className="text-xs text-muted-foreground">
            {generated.workout.date} · {generated.workout.phase} · Schedule {generated.workout.schedule}
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={handleCopy} className="gap-1 h-8">
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          <span className="text-xs">{copied ? "Copied" : "Copy"}</span>
        </Button>
      </div>

      {Array.from(phases.entries()).map(([phaseName, exercises]) => (
        <div key={phaseName}>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs text-muted-foreground uppercase tracking-wider">
              {formatPhaseName(phaseName)}
            </h3>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs gap-1 text-muted-foreground"
              onClick={() => onAddExercise(phaseName)}
            >
              <Plus className="h-3 w-3" />
              Add
            </Button>
          </div>
          <div className="space-y-2">
            {exercises.map((ex) => {
              const exercise = getExerciseById(ex.exerciseId);
              if (!exercise) return null;
              return (
                <Card key={ex.index} className="p-3 bg-card border-border">
                  <div className="flex items-start justify-between gap-1">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{exercise.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-muted-foreground">
                          {ex.targetSets} × {ex.targetReps}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          RPE {ex.targetRpe}
                        </span>
                        {ex.restSec > 0 && (
                          <span className="text-xs text-muted-foreground">
                            {ex.restSec}s rest
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-0.5 shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                        onClick={() => onSwapExercise(ex.index)}
                        title="Swap exercise"
                      >
                        <ArrowLeftRight className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                        onClick={() => onRemoveExercise(ex.index)}
                        title="Remove exercise"
                      >
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      ))}

      {/* Add to a new section if workout is empty or user wants more */}
      {generated.exercises.length === 0 && (
        <div className="text-center py-6">
          <p className="text-sm text-muted-foreground mb-3">No exercises yet</p>
          <Button variant="outline" onClick={() => onAddExercise("custom")} className="gap-1">
            <Plus className="h-4 w-4" />
            Add Exercise
          </Button>
        </div>
      )}

      <div className="flex gap-2">
        {isHistorical && onSaveAsCompleted ? (
          <Button onClick={onSaveAsCompleted} className="flex-1" size="lg" disabled={generated.exercises.length === 0}>
            <Check className="h-4 w-4 mr-2" />
            Save as Completed
          </Button>
        ) : (
          <Button onClick={onStartWorkout} className="flex-1" size="lg" disabled={generated.exercises.length === 0}>
            Start Workout
          </Button>
        )}
      </div>
    </div>
  );
}

function formatPhaseName(phase: string): string {
  return phase.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatWorkoutForClipboard(generated: GeneratedWorkout): string {
  const template = getDayTemplate(generated.workout.templateId);
  const lines: string[] = [];

  lines.push(template?.label ?? "Workout");
  lines.push(`${generated.workout.date} · ${generated.workout.phase} · Schedule ${generated.workout.schedule}`);
  lines.push("");

  // Group by phase
  const phases = new Map<string, typeof generated.exercises>();
  for (const ex of generated.exercises) {
    const group = phases.get(ex.templatePhase) ?? [];
    group.push(ex);
    phases.set(ex.templatePhase, group);
  }

  for (const [phase, exercises] of phases) {
    lines.push(formatPhaseName(phase).toUpperCase());
    for (const ex of exercises) {
      const exercise = getExerciseById(ex.exerciseId);
      if (!exercise) continue;
      lines.push(`  ${exercise.name} — ${ex.targetSets}×${ex.targetReps} @ RPE ${ex.targetRpe}`);
    }
    lines.push("");
  }

  return lines.join("\n").trim();
}
