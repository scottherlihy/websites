import Dexie, { type EntityTable } from "dexie";
import type { Exercise } from "../../types/exercise";
import type { Workout, WorkoutExercise, SetLog } from "../../types/workout";
import type { BodyMetric, BenchmarkTest, UserConfig } from "../../types/tracking";

const db = new Dexie("ExerciseTracker") as Dexie & {
  workouts: EntityTable<Workout, "id">;
  exerciseLogs: EntityTable<WorkoutExercise, "id">;
  sets: EntityTable<SetLog, "id">;
  bodyMetrics: EntityTable<BodyMetric, "id">;
  benchmarkTests: EntityTable<BenchmarkTest, "id">;
  userConfig: EntityTable<UserConfig, "id">;
  customExercises: EntityTable<Exercise, "id">;
};

db.version(1).stores({
  workouts: "++id, date, templateId, status",
  exerciseLogs: "++id, workoutId, exerciseId, order",
  sets: "++id, exerciseLogId, setNumber",
  bodyMetrics: "++id, date",
  benchmarkTests: "++id, date, benchmarkId",
  userConfig: "++id",
});

db.version(2).stores({
  customExercises: "id, name, training_pillar",
});

export { db };
