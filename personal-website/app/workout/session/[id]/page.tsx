"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "../../components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { StrengthCard } from "../../components/workout/strength-card";
import { CardioCard } from "../../components/workout/cardio-card";
import { StabilityCard } from "../../components/workout/stability-card";
import { RestTimer } from "../../components/workout/rest-timer";
import { WorkoutSummary } from "../../components/workout/workout-summary";
import { useActiveWorkout } from "../../stores/active-workout";
import { useExerciseLogs, useUpdateWorkout, useSaveSets } from "../../lib/db/hooks";
import { getExerciseById } from "../../lib/engine/exercise-bank";

export default function WorkoutPage() {
  const params = useParams();
  const router = useRouter();
  const workoutId = params.id as string;

  const exerciseLogs = useExerciseLogs(workoutId);
  const updateWorkout = useUpdateWorkout();
  const saveSetsToDb = useSaveSets();

  const { exercises, currentExerciseIndex, initWorkout, setCurrentExercise, reset } =
    useActiveWorkout();
  const [showSummary, setShowSummary] = useState(false);

  // Initialize workout from DB exercise logs
  useEffect(() => {
    if (exerciseLogs.length > 0 && exercises.length === 0) {
      const activeExercises = exerciseLogs.map((log) => {
        const exercise = getExerciseById(log.exerciseId);
        const trackingUnit = exercise?.tracking_unit ?? "weight_reps";
        const isCardioOrStability =
          trackingUnit === "duration" || trackingUnit === "hr_zone";

        const numSets = isCardioOrStability ? 1 : log.targetSets;
        const sets = Array.from({ length: numSets }, (_, i) => ({
          setNumber: i + 1,
          completed: false,
        }));

        return {
          exerciseLogId: String(log.id),
          exerciseId: log.exerciseId,
          templatePhase: log.templatePhase,
          targetSets: log.targetSets,
          targetReps: log.targetReps,
          targetRpe: log.targetRpe,
          restSec: log.restSec,
          sets,
        };
      });

      initWorkout(workoutId, activeExercises);
    }
  }, [exerciseLogs, exercises.length, workoutId, initWorkout]);

  const handleFinish = useCallback(async () => {
    // Save all sets to DB
    for (const ex of useActiveWorkout.getState().exercises) {
      const completedSets = ex.sets.filter((s) => s.completed);
      if (completedSets.length > 0) {
        await saveSetsToDb(
          completedSets.map((s) => ({
            exerciseLogId: ex.exerciseLogId,
            setNumber: s.setNumber,
            weight: s.weight,
            reps: s.reps,
            rpe: s.rpe,
            duration: s.duration,
            heartRate: s.heartRate,
            completed: true,
          }))
        );
      }
    }

    // Calculate duration
    const startTime = useActiveWorkout.getState().startTime;
    const duration = startTime ? Math.round((Date.now() - startTime) / 60000) : undefined;

    // Mark workout as completed
    await updateWorkout(workoutId, { status: "completed", duration });

    reset();
    router.push("/workout/dashboard");
  }, [workoutId, updateWorkout, saveSetsToDb, reset, router]);

  if (exercises.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-muted-foreground">Loading workout...</p>
      </div>
    );
  }

  if (showSummary) {
    return (
      <div className="space-y-6">
        <WorkoutSummary onFinish={handleFinish} />
      </div>
    );
  }

  const currentExercise = exercises[currentExerciseIndex];
  const exerciseData = getExerciseById(currentExercise.exerciseId);
  const trackingUnit = exerciseData?.tracking_unit ?? "weight_reps";
  const trainingPillar = exerciseData?.training_pillar;

  const isStrength = trackingUnit === "weight_reps" && trainingPillar !== "stability_mobility";
  const isCardio = trackingUnit === "duration" || trackingUnit === "hr_zone" ||
    trainingPillar === "zone2_cardio" || trainingPillar === "vo2max_interval";
  const isStability = trainingPillar === "stability_mobility";

  return (
    <div className="space-y-4">
      <RestTimer />

      {/* Progress bar */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          Exercise {currentExerciseIndex + 1} of {exercises.length}
        </span>
        <span className="text-xs text-muted-foreground">
          {currentExercise.templatePhase.replace(/_/g, " ")}
        </span>
      </div>
      <div className="w-full bg-muted rounded-full h-1.5">
        <div
          className="bg-foreground h-1.5 rounded-full transition-all"
          style={{
            width: `${((currentExerciseIndex + 1) / exercises.length) * 100}%`,
          }}
        />
      </div>

      {/* Exercise card */}
      {isStability && <StabilityCard exerciseIndex={currentExerciseIndex} />}
      {isCardio && !isStability && <CardioCard exerciseIndex={currentExerciseIndex} />}
      {isStrength && !isCardio && !isStability && (
        <StrengthCard exerciseIndex={currentExerciseIndex} />
      )}

      {/* Navigation */}
      <div className="flex gap-3">
        <Button
          variant="outline"
          className="flex-1"
          onClick={() => setCurrentExercise(currentExerciseIndex - 1)}
          disabled={currentExerciseIndex === 0}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Previous
        </Button>

        {currentExerciseIndex < exercises.length - 1 ? (
          <Button
            className="flex-1"
            onClick={() => setCurrentExercise(currentExerciseIndex + 1)}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        ) : (
          <Button className="flex-1" onClick={() => setShowSummary(true)}>
            Finish Workout
          </Button>
        )}
      </div>
    </div>
  );
}
