import type { Bucket, DayTemplate, Equipment, DifficultyTier, StrengthPrescription } from "../../types/exercise";
import type { Workout, WorkoutExercise } from "../../types/workout";
import type { PeriodizationState, WeeklyBucketProgress } from "../../types/tracking";
import { localToday as _localToday } from "../../lib/utils";
import {
  getDayTemplates,
  getExerciseById,
  getExercisesMatching,
} from "./exercise-bank";

export interface GenerateOptions {
  bucketProgress: WeeklyBucketProgress;
  periodization: PeriodizationState;
  equipment: Equipment[];
  difficultyTier: DifficultyTier;
  templateOverride?: string; // force a specific template
  recentExerciseIds?: string[]; // exercises used in last 2 workouts, for variety
  date?: string; // ISO date string, defaults to today
}

export interface GeneratedWorkout {
  workout: Omit<Workout, "id">;
  exercises: Omit<WorkoutExercise, "id" | "workoutId">[];
}

/**
 * Generate a workout based on current bucket deficits and periodization state.
 *
 * Algorithm:
 * 1. Compute deficit per bucket (target - current)
 * 2. Score each day template by how many deficit-buckets it covers
 * 3. Pick best template (or use override)
 * 4. For each phase in template, resolve exercise choices
 * 5. Apply prescription for current schedule, with deload modifier
 */
export function generateWorkout(options: GenerateOptions): GeneratedWorkout {
  const {
    bucketProgress,
    periodization,
    equipment,
    difficultyTier,
    templateOverride,
    recentExerciseIds = [],
  } = options;

  // 1. Select template
  const templateId = templateOverride ?? selectBestTemplate(bucketProgress);
  const templates = getDayTemplates();
  const template = templates[templateId];

  if (!template) {
    throw new Error(`Template not found: ${templateId}`);
  }

  // 2. Resolve exercises for each phase
  const exercises: Omit<WorkoutExercise, "id" | "workoutId">[] = [];
  let order = 0;

  for (const phase of template.structure) {
    for (const exerciseSlot of phase.exercises) {
      // Parse "id_a OR id_b OR id_c" choices
      const candidates = exerciseSlot.split(" OR ").map((s) => s.trim());
      const selected = selectExercise(
        candidates,
        equipment,
        difficultyTier,
        recentExerciseIds
      );

      if (!selected) continue;

      const exercise = getExerciseById(selected);
      if (!exercise) continue;

      // Apply prescription
      const prescription = getPrescription(exercise, periodization);

      exercises.push({
        exerciseId: selected,
        order: order++,
        templatePhase: phase.phase,
        targetSets: prescription.sets,
        targetReps: prescription.reps,
        targetRpe: prescription.rpe,
        restSec: prescription.restSec,
      });
    }
  }

  const today = options.date ?? _localToday();

  return {
    workout: {
      date: today,
      templateId,
      status: "planned",
      phase: periodization.phaseName,
      schedule: periodization.schedule,
      bucketsFilled: template.buckets_filled,
    },
    exercises,
  };
}

/**
 * Score templates by deficit coverage and return the best one.
 */
function selectBestTemplate(progress: WeeklyBucketProgress): string {
  const templates = getDayTemplates();
  let bestId = "day_a_lower_power";
  let bestScore = -1;

  for (const [id, template] of Object.entries(templates)) {
    let score = 0;
    for (const bucket of template.buckets_filled) {
      const bp = progress[bucket as Bucket];
      if (bp && bp.percentage < 100) {
        // Higher deficit = higher score
        score += (100 - bp.percentage) / 100;
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestId = id;
    }
  }

  return bestId;
}

/**
 * Pick the best exercise from OR-separated candidates.
 * Prefers: available equipment > within difficulty > not recently used.
 */
function selectExercise(
  candidateIds: string[],
  equipment: Equipment[],
  maxDifficulty: DifficultyTier,
  recentIds: string[]
): string | null {
  // Filter candidates that exist and meet equipment/difficulty requirements
  const viable = candidateIds.filter((id) => {
    const ex = getExerciseById(id);
    if (!ex) return false;

    // Check equipment availability
    const hasEquipment = ex.equipment.some((eq) => equipment.includes(eq));
    if (!hasEquipment) return false;

    // Check difficulty
    const tierOrder: DifficultyTier[] = ["beginner", "intermediate", "advanced"];
    if (tierOrder.indexOf(ex.difficulty_tier) > tierOrder.indexOf(maxDifficulty)) {
      return false;
    }

    return true;
  });

  if (viable.length === 0) {
    // Fallback: try any candidate regardless of filters
    return candidateIds.find((id) => getExerciseById(id)) ?? null;
  }

  // Prefer exercises not recently used
  const notRecent = viable.filter((id) => !recentIds.includes(id));
  if (notRecent.length > 0) {
    return notRecent[0];
  }

  return viable[0];
}

interface ResolvedPrescription {
  sets: number;
  reps: string;
  rpe: string;
  restSec: number;
}

/**
 * Get the prescription for an exercise based on current periodization.
 */
function getPrescription(
  exercise: ReturnType<typeof getExerciseById> & {},
  periodization: PeriodizationState
): ResolvedPrescription {
  const scheduleKey = periodization.schedule === "A" ? "schedule_a" : "schedule_b";
  const prescription = exercise.default_prescription[scheduleKey];
  const baseRpe = exercise.default_prescription.rpe ?? "7";

  // Handle different prescription shapes
  if ("sets" in prescription) {
    const strengthRx = prescription as StrengthPrescription;
    let sets = strengthRx.sets;
    let rpe = baseRpe;

    // Deload: reduce to ~70% effort
    if (periodization.isDeload) {
      sets = Math.max(2, sets - 1);
      rpe = String(Math.max(3, parseFloat(rpe.split("-")[0]) - 2));
    }

    // Building phase: add a 4th set to main lifts
    if (
      periodization.phaseName === "Building" &&
      !periodization.isDeload &&
      exercise.compound_isolation === "compound" &&
      sets < 4
    ) {
      sets = 4;
    }

    return {
      sets,
      reps: strengthRx.reps,
      rpe,
      restSec: strengthRx.rest_sec,
    };
  }

  // Cardio / VO2max / stability: use duration-based defaults
  if ("duration_min" in prescription) {
    return {
      sets: 1,
      reps: String(prescription.duration_min) + " min",
      rpe: (prescription as { rpe?: string }).rpe ?? baseRpe,
      restSec: 0,
    };
  }

  if ("intervals" in prescription) {
    const vo2max = prescription as { intervals: string; total_min: number; rpe_work: string };
    return {
      sets: 1,
      reps: vo2max.intervals,
      rpe: vo2max.rpe_work,
      restSec: 0,
    };
  }

  // Fallback
  return { sets: 3, reps: "8-12", rpe: baseRpe, restSec: 90 };
}

/**
 * Get available template options with their labels and bucket coverage.
 */
export function getTemplateOptions(): Array<{
  id: string;
  label: string;
  buckets: Bucket[];
  estimatedMinutes: number;
}> {
  const templates = getDayTemplates();
  return Object.entries(templates).map(([id, t]) => ({
    id,
    label: t.label,
    buckets: t.buckets_filled,
    estimatedMinutes: t.estimated_duration_min,
  }));
}
