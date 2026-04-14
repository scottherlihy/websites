import type { Bucket } from "./exercise";

export interface BucketProgress {
  bucket: Bucket;
  label: string;
  current: number;
  target: number;
  unit: string;
  percentage: number; // 0-100, capped at 100
  // Volume tracking (strength/power buckets only)
  weeklySets?: number; // total completed sets this week
  weeklyVolume?: number; // total kg × reps this week
  weeklySetTarget?: number; // research-based minimum sets/week
}

export type WeeklyBucketProgress = Record<Bucket, BucketProgress>;

export interface BodyMetric {
  id?: string;
  date: string; // ISO date
  weight?: number; // kg
  bodyFat?: number; // percentage
  restingHR?: number; // bpm
  hrv?: number; // ms
}

export interface BenchmarkTest {
  id?: string;
  date: string; // ISO date
  benchmarkId: string;
  value: number;
  unit: string;
  notes?: string;
}

export interface UserConfig {
  id?: string;
  startDate: string; // ISO date — when the 12-week program began
  currentWeek: number;
  equipment: string[]; // available equipment IDs
  difficultyTier: "beginner" | "intermediate" | "advanced";
  bodyweight?: number; // kg, for benchmark ratios
  maxHR?: number; // bpm
}

export interface PeriodizationState {
  weekNumber: number;
  phaseName: string;
  schedule: "A" | "B";
  isDeload: boolean;
  repRange: string;
  focus: string;
}
