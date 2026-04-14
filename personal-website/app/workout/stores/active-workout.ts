import { create } from "zustand";

interface ActiveSet {
  setNumber: number;
  weight?: number;
  reps?: number;
  rpe?: number;
  duration?: number; // seconds
  heartRate?: number;
  completed: boolean;
}

interface ActiveExercise {
  exerciseLogId: string;
  exerciseId: string;
  templatePhase: string;
  targetSets: number;
  targetReps: string;
  targetRpe: string;
  restSec: number;
  sets: ActiveSet[];
}

interface ActiveWorkoutState {
  workoutId: string | null;
  exercises: ActiveExercise[];
  currentExerciseIndex: number;
  startTime: number | null;
  restTimerEnd: number | null;

  // Actions
  initWorkout: (workoutId: string, exercises: ActiveExercise[]) => void;
  setCurrentExercise: (index: number) => void;
  updateSet: (exerciseIndex: number, setIndex: number, updates: Partial<ActiveSet>) => void;
  completeSet: (exerciseIndex: number, setIndex: number) => void;
  addSet: (exerciseIndex: number) => void;
  startRestTimer: (seconds: number) => void;
  clearRestTimer: () => void;
  reset: () => void;
}

export const useActiveWorkout = create<ActiveWorkoutState>((set) => ({
  workoutId: null,
  exercises: [],
  currentExerciseIndex: 0,
  startTime: null,
  restTimerEnd: null,

  initWorkout: (workoutId, exercises) =>
    set({
      workoutId,
      exercises,
      currentExerciseIndex: 0,
      startTime: Date.now(),
      restTimerEnd: null,
    }),

  setCurrentExercise: (index) => set({ currentExerciseIndex: index }),

  updateSet: (exerciseIndex, setIndex, updates) =>
    set((state) => {
      const exercises = [...state.exercises];
      const exercise = { ...exercises[exerciseIndex] };
      exercise.sets = [...exercise.sets];
      exercise.sets[setIndex] = { ...exercise.sets[setIndex], ...updates };
      exercises[exerciseIndex] = exercise;
      return { exercises };
    }),

  completeSet: (exerciseIndex, setIndex) =>
    set((state) => {
      const exercises = [...state.exercises];
      const exercise = { ...exercises[exerciseIndex] };
      exercise.sets = [...exercise.sets];
      exercise.sets[setIndex] = { ...exercise.sets[setIndex], completed: true };
      exercises[exerciseIndex] = exercise;
      return { exercises };
    }),

  addSet: (exerciseIndex) =>
    set((state) => {
      const exercises = [...state.exercises];
      const exercise = { ...exercises[exerciseIndex] };
      const lastSet = exercise.sets[exercise.sets.length - 1];
      exercise.sets = [
        ...exercise.sets,
        {
          setNumber: exercise.sets.length + 1,
          weight: lastSet?.weight,
          reps: lastSet?.reps,
          completed: false,
        },
      ];
      exercises[exerciseIndex] = exercise;
      return { exercises };
    }),

  startRestTimer: (seconds) =>
    set({ restTimerEnd: Date.now() + seconds * 1000 }),

  clearRestTimer: () => set({ restTimerEnd: null }),

  reset: () =>
    set({
      workoutId: null,
      exercises: [],
      currentExerciseIndex: 0,
      startTime: null,
      restTimerEnd: null,
    }),
}));
