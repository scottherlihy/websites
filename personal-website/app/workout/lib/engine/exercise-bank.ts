import exerciseBankData from "../../data/exercise-bank.json";
import type {
  Exercise,
  ExerciseBank,
  Bucket,
  Equipment,
  MovementPattern,
  DifficultyTier,
  DayTemplate,
  WeeklyGoal,
  BenchmarkDefinition,
  PeriodizationPhase,
} from "../../types/exercise";

const bank = exerciseBankData as unknown as ExerciseBank;

const exercisesById = new Map<string, Exercise>();
for (const ex of bank.exercises) {
  exercisesById.set(ex.id, ex);
}

// Custom exercises registered at runtime from IndexedDB
const customExercises: Exercise[] = [];

/**
 * Register custom exercises from IndexedDB into the in-memory bank.
 * Called by the UI layer when custom exercises are loaded.
 */
export function registerCustomExercises(exercises: Exercise[]) {
  // Clear previous custom entries
  for (const ex of customExercises) {
    exercisesById.delete(ex.id);
  }
  customExercises.length = 0;

  // Add new ones
  for (const ex of exercises) {
    customExercises.push(ex);
    exercisesById.set(ex.id, ex);
  }
}

// ─── Exercise Accessors ──────────────────────────────────────

export function getAllExercises(): Exercise[] {
  return [...bank.exercises, ...customExercises];
}

export function getExerciseById(id: string): Exercise | undefined {
  return exercisesById.get(id);
}

export function getExercisesByBucket(bucket: Bucket): Exercise[] {
  return getAllExercises().filter((e) => e.bucket.includes(bucket));
}

export function getExercisesByEquipment(equipment: Equipment[]): Exercise[] {
  return getAllExercises().filter((e) =>
    e.equipment.some((eq) => equipment.includes(eq))
  );
}

export function getExercisesByMovementPattern(pattern: MovementPattern): Exercise[] {
  return getAllExercises().filter((e) => e.movement_pattern === pattern);
}

export function getExercisesByDifficulty(
  maxTier: DifficultyTier
): Exercise[] {
  const tierOrder: DifficultyTier[] = ["beginner", "intermediate", "advanced"];
  const maxIndex = tierOrder.indexOf(maxTier);
  return getAllExercises().filter(
    (e) => tierOrder.indexOf(e.difficulty_tier) <= maxIndex
  );
}

export function getExercisesMatching(filters: {
  bucket?: Bucket;
  equipment?: Equipment[];
  maxDifficulty?: DifficultyTier;
  movementPattern?: MovementPattern;
}): Exercise[] {
  const tierOrder: DifficultyTier[] = ["beginner", "intermediate", "advanced"];
  const maxIndex = filters.maxDifficulty
    ? tierOrder.indexOf(filters.maxDifficulty)
    : 2;

  return getAllExercises().filter((e) => {
    if (filters.bucket && !e.bucket.includes(filters.bucket)) return false;
    if (
      filters.equipment &&
      !e.equipment.some((eq) => filters.equipment!.includes(eq))
    )
      return false;
    if (tierOrder.indexOf(e.difficulty_tier) > maxIndex) return false;
    if (filters.movementPattern && e.movement_pattern !== filters.movementPattern)
      return false;
    return true;
  });
}

// ─── Templates ───────────────────────────────────────────────

export function getDayTemplates(): Record<string, DayTemplate> {
  return bank.suggested_day_templates;
}

export function getDayTemplate(id: string): DayTemplate | undefined {
  return bank.suggested_day_templates[id];
}

// ─── Weekly Goals ────────────────────────────────────────────

export function getWeeklyGoals(): Record<string, WeeklyGoal> {
  return bank.weekly_goals;
}

// ─── Benchmarks ──────────────────────────────────────────────

export function getBenchmarkDefinitions(): Record<string, BenchmarkDefinition> {
  return bank.longevity_benchmarks;
}

// ─── Periodization ───────────────────────────────────────────

export function getPeriodizationPhases(): Record<string, PeriodizationPhase> {
  return bank.periodization;
}
