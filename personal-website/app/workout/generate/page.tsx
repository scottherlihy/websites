"use client";

import { useState, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { GeneratorForm } from "../components/generate/generator-form";
import { WorkoutPreview } from "../components/generate/workout-preview";
import { ExercisePickerSheet } from "../components/generate/exercise-picker-sheet";
import { generateWorkout, type GeneratedWorkout } from "../lib/engine/workout-generator";
import { getExerciseById } from "../lib/engine/exercise-bank";
import { getCurrentPhase, getWeekStart } from "../lib/engine/periodization";
import { calculateWeeklyProgress } from "../lib/engine/bucket-tracker";
import { useUserConfig, useBucketProgress, useSaveWorkout, useSaveExerciseLogs } from "../lib/db/hooks";
import { getWeeklyGoals } from "../lib/engine/exercise-bank";
import { localToday } from "../lib/utils";
import type { Bucket, Equipment, StrengthPrescription } from "../types/exercise";
import type { WeeklyBucketProgress } from "../types/tracking";
import type { WorkoutExercise } from "../types/workout";

export default function GeneratePage() {
  return (
    <Suspense>
      <GeneratePageContent />
    </Suspense>
  );
}

function buildEmptyProgress(): WeeklyBucketProgress {
  const goals = getWeeklyGoals();
  const buckets: Bucket[] = [
    "zone2_cardio", "vo2max_intervals", "strength_push", "strength_pull",
    "strength_lower", "power", "stability_mobility", "rest_days",
  ];
  const progress = {} as WeeklyBucketProgress;
  for (const b of buckets) {
    const goal = goals[b];
    const target = (() => {
      if (!goal) return 0;
      switch (b) {
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
    })();
    progress[b] = { bucket: b, label: goal?.label ?? b, current: 0, target, unit: goal?.unit ?? "sessions", percentage: 0 };
  }
  return progress;
}

type PickerMode =
  | { type: "swap"; index: number }
  | { type: "add"; phase: string }
  | null;

function GeneratePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const config = useUserConfig();
  const weekStart = getWeekStart();
  const bucketData = useBucketProgress(weekStart);
  const saveWorkout = useSaveWorkout();
  const saveExerciseLogs = useSaveExerciseLogs();

  const today = localToday();
  const initialTemplate = searchParams.get("template") ?? "auto";
  const [selectedTemplate, setSelectedTemplate] = useState(initialTemplate);
  const [selectedDate, setSelectedDate] = useState(today);
  const [availableTime, setAvailableTime] = useState("");
  const [generated, setGenerated] = useState<GeneratedWorkout | null>(null);
  const [pickerMode, setPickerMode] = useState<PickerMode>(null);

  const isHistorical = selectedDate < today;

  const progress = bucketData
    ? calculateWeeklyProgress(bucketData.workouts, bucketData.exerciseLogs, bucketData.sets)
    : buildEmptyProgress();

  const phase = getCurrentPhase(config.startDate, selectedDate);

  // --- Generate ---
  const handleGenerate = useCallback(() => {
    const templateToUse = selectedTemplate === "auto" ? undefined : selectedTemplate;

    const result = generateWorkout({
      bucketProgress: progress,
      periodization: phase,
      equipment: config.equipment as Equipment[],
      difficultyTier: config.difficultyTier,
      templateOverride: templateToUse,
      date: selectedDate,
    });

    // Filter by available time if set
    if (availableTime) {
      const maxMin = Number(availableTime);
      if (maxMin > 0) {
        // Keep exercises roughly within time budget
        // Rough estimate: strength ~4min/exercise, cardio = duration, stability ~2min
        let runningMin = 0;
        result.exercises = result.exercises.filter((ex) => {
          const exercise = getExerciseById(ex.exerciseId);
          if (!exercise) return false;
          const estMin =
            exercise.training_pillar === "zone2_cardio" || exercise.training_pillar === "vo2max_interval"
              ? parseFloat(ex.targetReps) || 20
              : exercise.training_pillar === "stability_mobility"
              ? 2
              : ex.targetSets * 2 + (ex.restSec * (ex.targetSets - 1)) / 60;
          runningMin += estMin;
          return runningMin <= maxMin;
        });
      }
    }

    setGenerated(result);
  }, [progress, phase, config, selectedTemplate, selectedDate, availableTime]);

  // --- Historical: start empty manual build ---
  const handleStartManualBuild = useCallback(() => {
    setGenerated({
      workout: {
        date: selectedDate,
        templateId: "custom",
        status: "planned",
        phase: phase.phaseName,
        schedule: phase.schedule,
        bucketsFilled: [],
      },
      exercises: [],
    });
  }, [selectedDate, phase]);

  // --- Exercise management ---
  const handleSwapExercise = useCallback(
    (index: number) => {
      setPickerMode({ type: "swap", index });
    },
    []
  );

  const handleRemoveExercise = useCallback(
    (index: number) => {
      if (!generated) return;
      const newExercises = generated.exercises.filter((_, i) => i !== index)
        .map((ex, i) => ({ ...ex, order: i }));
      setGenerated({ ...generated, exercises: newExercises });
    },
    [generated]
  );

  const handleAddExercise = useCallback(
    (phase?: string) => {
      setPickerMode({ type: "add", phase: phase ?? "custom" });
    },
    []
  );

  const handlePickerSelect = useCallback(
    (exerciseId: string) => {
      if (!generated || !pickerMode) return;

      const exercise = getExerciseById(exerciseId);
      if (!exercise) return;

      const scheduleKey = phase.schedule === "A" ? "schedule_a" : "schedule_b";
      const rx = exercise.default_prescription[scheduleKey];

      const newEntry: Omit<WorkoutExercise, "id" | "workoutId"> = {
        exerciseId,
        order: 0,
        templatePhase: pickerMode.type === "add" ? pickerMode.phase : generated.exercises[pickerMode.index]?.templatePhase ?? "custom",
        targetSets: "sets" in rx ? (rx as StrengthPrescription).sets : 1,
        targetReps: "reps" in rx ? (rx as StrengthPrescription).reps : "duration_min" in rx ? String((rx as { duration_min: string | number }).duration_min) + " min" : "1",
        targetRpe: exercise.default_prescription.rpe ?? "7",
        restSec: "rest_sec" in rx ? (rx as StrengthPrescription).rest_sec : 0,
      };

      let newExercises: typeof generated.exercises;

      if (pickerMode.type === "swap") {
        newExercises = [...generated.exercises];
        newExercises[pickerMode.index] = { ...newExercises[pickerMode.index], ...newEntry, order: newExercises[pickerMode.index].order };
      } else {
        // Add: insert at end of the phase, or at end of list
        const phaseExercises = generated.exercises.filter((e) => e.templatePhase === pickerMode.phase);
        const lastInPhase = phaseExercises.length > 0
          ? generated.exercises.indexOf(phaseExercises[phaseExercises.length - 1])
          : generated.exercises.length - 1;
        newExercises = [...generated.exercises];
        newExercises.splice(lastInPhase + 1, 0, newEntry);
      }

      // Recompute order and bucketsFilled
      newExercises = newExercises.map((ex, i) => ({ ...ex, order: i }));
      const filledBuckets = new Set<Bucket>();
      for (const ex of newExercises) {
        const exData = getExerciseById(ex.exerciseId);
        if (exData) {
          for (const b of exData.bucket) filledBuckets.add(b);
        }
      }

      setGenerated({
        ...generated,
        workout: { ...generated.workout, bucketsFilled: Array.from(filledBuckets) },
        exercises: newExercises,
      });
      setPickerMode(null);
    },
    [generated, pickerMode, phase]
  );

  // --- Save ---
  const handleStartWorkout = useCallback(async () => {
    if (!generated) return;
    const workoutId = await saveWorkout({
      ...generated.workout,
      status: "in_progress",
    });
    await saveExerciseLogs(
      generated.exercises.map((ex) => ({ ...ex, workoutId }))
    );
    router.push(`/workout/session/${workoutId}`);
  }, [generated, saveWorkout, saveExerciseLogs, router]);

  const handleSaveAsCompleted = useCallback(async () => {
    if (!generated) return;
    await saveWorkout({
      ...generated.workout,
      status: "completed",
    });
    router.push("/workout/dashboard");
  }, [generated, saveWorkout, router]);

  // Current exercise IDs for excluding from picker
  const currentExerciseIds = generated?.exercises.map((e) => e.exerciseId) ?? [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">
        {isHistorical ? "Log Past Workout" : "Generate Workout"}
      </h1>

      <GeneratorForm
        selectedTemplate={selectedTemplate}
        onTemplateChange={(t) => { setSelectedTemplate(t); setGenerated(null); }}
        selectedDate={selectedDate}
        onDateChange={(d) => { setSelectedDate(d); setGenerated(null); }}
        availableTime={availableTime}
        onTimeChange={setAvailableTime}
        onGenerate={handleGenerate}
        isHistorical={isHistorical}
        onStartManualBuild={handleStartManualBuild}
      />

      {generated && (
        <WorkoutPreview
          generated={generated}
          onSwapExercise={(idx) => handleSwapExercise(idx)}
          onRemoveExercise={handleRemoveExercise}
          onAddExercise={handleAddExercise}
          onStartWorkout={handleStartWorkout}
          isHistorical={isHistorical}
          onSaveAsCompleted={handleSaveAsCompleted}
        />
      )}

      <ExercisePickerSheet
        open={pickerMode !== null}
        onClose={() => setPickerMode(null)}
        onSelect={handlePickerSelect}
        title={pickerMode?.type === "swap" ? "Swap Exercise" : "Add Exercise"}
        equipment={config.equipment as Equipment[]}
        difficultyTier={config.difficultyTier}
        excludeIds={pickerMode?.type === "add" ? currentExerciseIds : []}
      />
    </div>
  );
}
