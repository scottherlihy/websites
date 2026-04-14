// Bucket IDs as they appear in exercise-bank.json
export type Bucket =
  | "zone2_cardio"
  | "vo2max_intervals"
  | "strength_push"
  | "strength_pull"
  | "strength_lower"
  | "power"
  | "stability_mobility"
  | "rest_days";

export type MovementPattern =
  | "squat"
  | "hinge"
  | "horizontal_push"
  | "vertical_push"
  | "horizontal_pull"
  | "vertical_pull"
  | "carry"
  | "rotation"
  | "locomotion"
  | "core_stabilization";

export type TrainingPillar =
  | "strength"
  | "zone2_cardio"
  | "vo2max_interval"
  | "stability_mobility"
  | "power";

export type FiberTypeBias = "slow_twitch" | "fast_twitch" | "mixed";

export type CompoundIsolation = "compound" | "isolation";

export type BilateralUnilateral = "bilateral" | "unilateral";

export type Equipment =
  | "barbell"
  | "dumbbell"
  | "kettlebell"
  | "cable_machine"
  | "bodyweight"
  | "band"
  | "cardio_machine"
  | "none";

export type TrackingUnit = "weight_reps" | "duration" | "hr_zone" | "weight_duration";

export type DifficultyTier = "beginner" | "intermediate" | "advanced";

export type JointStressLevel = "low" | "moderate" | "high";

// Prescription variants — shape varies by training pillar
export interface StrengthPrescription {
  sets: number;
  reps: string;
  rest_sec: number;
}

export interface CardioPrescription {
  duration_min: string;
  hr_zone: string;
  rpe: string;
}

export interface Vo2maxPrescription {
  warmup_min: number;
  intervals: string;
  recovery: string;
  cooldown_min: number;
  total_min: number;
  rpe_work: string;
  rpe_recovery: string;
}

export interface DefaultPrescription {
  schedule_a: StrengthPrescription | CardioPrescription | Vo2maxPrescription;
  schedule_b: StrengthPrescription | CardioPrescription | Vo2maxPrescription;
  rpe?: string;
}

export interface Exercise {
  id: string;
  name: string;
  bucket: Bucket[];
  movement_pattern: MovementPattern;
  training_pillar: TrainingPillar;
  fiber_type_bias: FiberTypeBias;
  compound_isolation: CompoundIsolation;
  bilateral_unilateral: BilateralUnilateral;
  primary_muscles: string[];
  secondary_muscles: string[];
  equipment: Equipment[];
  progression_chain: string[];
  tracking_unit: TrackingUnit;
  default_prescription: DefaultPrescription;
  joint_stress: Record<string, JointStressLevel>;
  longevity_benchmarks: string[];
  difficulty_tier: DifficultyTier;
  implicit_core: boolean;
  notes: string;
}

// Day template structures
export interface TemplatePhase {
  phase: string;
  duration_min: number | string;
  exercises: string[]; // Exercise IDs, may contain "id_a OR id_b" strings
}

export interface DayTemplate {
  label: string;
  buckets_filled: Bucket[];
  estimated_duration_min: number;
  structure: TemplatePhase[];
}

// Weekly goal definitions from exercise-bank.json
export interface WeeklyGoal {
  label: string;
  unit: string;
  description: string;
  // Different goals use different target fields
  target_min?: number;
  target_max?: number;
  target_sessions?: number;
  target_exposures?: number;
  target_exposures_min?: number;
  target_exposures_max?: number;
  target_frequency?: string;
  target_min_per_session?: number;
  sessions_target?: string;
}

// Longevity benchmark definition
export interface BenchmarkDefinition {
  label: string;
  unit: string;
  target: string;
  source?: string;
  test_frequency: string;
  test_method?: string;
  starting?: string;
  timeline?: string;
}

// Periodization phase definition
export interface PeriodizationPhase {
  weeks: string;
  schedule: string;
  rep_range: string;
  focus: string;
  zone2_start?: string;
  zone2?: string;
  vo2max: string;
  stability?: string;
  progression_rule?: string;
  deload?: string;
  targets?: string;
}

// Top-level exercise bank structure
export interface ExerciseBank {
  meta: {
    version: string;
    description: string;
    schema: Record<string, unknown>;
  };
  exercises: Exercise[];
  weekly_goals: Record<string, WeeklyGoal>;
  suggested_day_templates: Record<string, DayTemplate>;
  longevity_benchmarks: Record<string, BenchmarkDefinition>;
  periodization: Record<string, PeriodizationPhase>;
}
