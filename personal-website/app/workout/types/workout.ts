import type { Bucket } from "./exercise";

export type WorkoutStatus = "planned" | "in_progress" | "completed";

export interface Workout {
  id?: string;
  date: string; // ISO date string
  templateId: string;
  status: WorkoutStatus;
  duration?: number; // actual duration in minutes
  phase: string; // periodization phase name
  schedule: "A" | "B";
  bucketsFilled: Bucket[];
  notes?: string;
}

export interface WorkoutExercise {
  id?: string;
  workoutId: string;
  exerciseId: string;
  order: number;
  templatePhase: string; // which phase of the day template (warmup, main, etc.)
  targetSets: number;
  targetReps: string;
  targetRpe: string;
  restSec: number;
}

// Set log for strength exercises (weight_reps tracking)
export interface SetLog {
  id?: string;
  exerciseLogId: string;
  setNumber: number;
  weight?: number; // kg
  reps?: number;
  rpe?: number;
  duration?: number; // seconds, for timed exercises
  heartRate?: number;
  completed: boolean;
}

// Cardio log for zone2/vo2max exercises
export interface CardioLog {
  id?: string;
  exerciseLogId: string;
  durationMin: number;
  avgHeartRate?: number;
  hrZone?: string;
  notes?: string;
}
