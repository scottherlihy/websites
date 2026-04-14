"use client";

import { useEffect } from "react";
import { useCustomExercises } from "../lib/db/hooks";
import { registerCustomExercises } from "../lib/engine/exercise-bank";

/**
 * Syncs custom exercises from IndexedDB into the in-memory exercise bank.
 * Must be rendered inside the app to keep them in sync.
 */
export function CustomExerciseProvider({ children }: { children: React.ReactNode }) {
  const customExercises = useCustomExercises();

  useEffect(() => {
    registerCustomExercises(customExercises);
  }, [customExercises]);

  return <>{children}</>;
}
