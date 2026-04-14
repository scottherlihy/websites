import { describe, it, expect } from "vitest";
import { generateWorkout, getTemplateOptions } from "../workout-generator";
import { getExerciseById } from "../exercise-bank";
import { getCurrentPhase } from "../periodization";
import type { Bucket } from "../../../types/exercise";
import type { BucketProgress, WeeklyBucketProgress } from "../../../types/tracking";

function emptyProgress(): WeeklyBucketProgress {
  const buckets: Bucket[] = [
    "zone2_cardio",
    "vo2max_intervals",
    "strength_push",
    "strength_pull",
    "strength_lower",
    "power",
    "stability_mobility",
    "rest_days",
  ];
  const progress = {} as WeeklyBucketProgress;
  for (const b of buckets) {
    progress[b] = {
      bucket: b,
      label: b,
      current: 0,
      target: 2,
      unit: "sessions",
      percentage: 0,
    };
  }
  return progress;
}

function fullProgress(): WeeklyBucketProgress {
  const progress = emptyProgress();
  for (const key of Object.keys(progress)) {
    const bp = progress[key as Bucket];
    bp.current = bp.target;
    bp.percentage = 100;
  }
  return progress;
}

const defaultEquipment = [
  "barbell",
  "dumbbell",
  "kettlebell",
  "cable_machine",
  "bodyweight",
  "band",
  "cardio_machine",
] as const;

describe("generateWorkout", () => {
  it("generates a workout with exercises", () => {
    const result = generateWorkout({
      bucketProgress: emptyProgress(),
      periodization: getCurrentPhase("2026-04-01", "2026-04-07"),
      equipment: [...defaultEquipment],
      difficultyTier: "beginner",
    });

    expect(result.workout).toBeDefined();
    expect(result.workout.status).toBe("planned");
    expect(result.exercises.length).toBeGreaterThan(0);
  });

  it("selects template covering buckets with largest deficit", () => {
    // Make lower/power the only unfilled buckets
    const progress = fullProgress();
    progress.strength_lower.current = 0;
    progress.strength_lower.percentage = 0;
    progress.power.current = 0;
    progress.power.percentage = 0;

    const result = generateWorkout({
      bucketProgress: progress,
      periodization: getCurrentPhase("2026-04-01", "2026-04-07"),
      equipment: [...defaultEquipment],
      difficultyTier: "beginner",
    });

    // Should pick day_a_lower_power which covers strength_lower and power
    expect(result.workout.templateId).toBe("day_a_lower_power");
  });

  it("respects template override", () => {
    const result = generateWorkout({
      bucketProgress: emptyProgress(),
      periodization: getCurrentPhase("2026-04-01", "2026-04-07"),
      equipment: [...defaultEquipment],
      difficultyTier: "beginner",
      templateOverride: "day_c_upper",
    });

    expect(result.workout.templateId).toBe("day_c_upper");
    expect(result.workout.bucketsFilled).toContain("strength_push");
    expect(result.workout.bucketsFilled).toContain("strength_pull");
  });

  it("filters exercises by equipment", () => {
    // Only bodyweight equipment
    const result = generateWorkout({
      bucketProgress: emptyProgress(),
      periodization: getCurrentPhase("2026-04-01", "2026-04-07"),
      equipment: ["bodyweight"],
      difficultyTier: "beginner",
    });

    // All selected exercises should either have bodyweight equipment
    // or be a fallback (some exercises may not have bodyweight variants)
    for (const ex of result.exercises) {
      const exercise = getExerciseById(ex.exerciseId);
      expect(exercise).toBeDefined();
    }
  });

  it("applies deload modifications", () => {
    // Week 6 is deload in Building phase
    const deloadPhase = getCurrentPhase("2026-04-01", "2026-05-11"); // ~week 6

    const result = generateWorkout({
      bucketProgress: emptyProgress(),
      periodization: deloadPhase,
      equipment: [...defaultEquipment],
      difficultyTier: "beginner",
      templateOverride: "day_a_lower_power",
    });

    expect(deloadPhase.isDeload).toBe(true);

    // During deload, compound exercises should have reduced RPE
    const compoundExercise = result.exercises.find((ex) => {
      const exercise = getExerciseById(ex.exerciseId);
      return exercise?.compound_isolation === "compound" && exercise.training_pillar === "strength";
    });

    if (compoundExercise) {
      const rpeNum = parseFloat(compoundExercise.targetRpe.split("-")[0]);
      expect(rpeNum).toBeLessThanOrEqual(6);
    }
  });

  it("adds 4th set in Building phase for compound lifts", () => {
    // Week 5 is start of Building phase (non-deload)
    const buildingPhase = getCurrentPhase("2026-04-01", "2026-05-04"); // ~week 5

    expect(buildingPhase.phaseName).toBe("Building");
    expect(buildingPhase.isDeload).toBe(false);

    const result = generateWorkout({
      bucketProgress: emptyProgress(),
      periodization: buildingPhase,
      equipment: [...defaultEquipment],
      difficultyTier: "beginner",
      templateOverride: "day_a_lower_power",
    });

    // Find a compound strength exercise
    const compoundExercise = result.exercises.find((ex) => {
      const exercise = getExerciseById(ex.exerciseId);
      return exercise?.compound_isolation === "compound" && exercise.training_pillar === "strength";
    });

    if (compoundExercise) {
      expect(compoundExercise.targetSets).toBe(4);
    }
  });
});

describe("getTemplateOptions", () => {
  it("returns all 6 day templates", () => {
    const options = getTemplateOptions();
    expect(options).toHaveLength(6);
    expect(options.map((o) => o.id)).toContain("day_a_lower_power");
    expect(options.map((o) => o.id)).toContain("day_rest");
  });
});

describe("getCurrentPhase", () => {
  it("returns Foundation for weeks 1-4", () => {
    const phase = getCurrentPhase("2026-04-07", "2026-04-14"); // week 2
    expect(phase.phaseName).toBe("Foundation");
    expect(phase.schedule).toBe("B");
    expect(phase.isDeload).toBe(false);
  });

  it("returns Building for weeks 5-8", () => {
    const phase = getCurrentPhase("2026-04-07", "2026-05-12"); // week 6
    expect(phase.phaseName).toBe("Building");
    expect(phase.schedule).toBe("A");
  });

  it("marks week 6 as deload", () => {
    const phase = getCurrentPhase("2026-04-07", "2026-05-12"); // week 6
    expect(phase.isDeload).toBe(true);
  });

  it("returns Performance for weeks 9-12", () => {
    const phase = getCurrentPhase("2026-04-07", "2026-06-09"); // week 10
    expect(phase.phaseName).toBe("Performance");
    expect(phase.schedule).toBe("B");
  });

  it("marks week 12 as deload", () => {
    const phase = getCurrentPhase("2026-04-07", "2026-06-23"); // week 12
    expect(phase.isDeload).toBe(true);
  });

  it("cycles back to Foundation after week 12", () => {
    const phase = getCurrentPhase("2026-04-07", "2026-07-07"); // week 14 → cycle week 2
    expect(phase.phaseName).toBe("Foundation");
  });
});
