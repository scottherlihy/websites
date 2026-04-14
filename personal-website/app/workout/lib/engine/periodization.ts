import type { PeriodizationState } from "../../types/tracking";
import { localToday } from "../../lib/utils";

/**
 * Determines the current periodization state based on program start date.
 *
 * 12-week cycle:
 *   Phase 1 (Foundation): weeks 1–4, Schedule B, 8–15 reps
 *   Phase 2 (Building):   weeks 5–8, Schedule A, 4–8 reps, deload week 6
 *   Phase 3 (Performance): weeks 9–12, Schedule B (heavier), 8–15 reps, rest week 12
 *
 * After week 12, the cycle repeats.
 */
export function getCurrentPhase(
  startDate: string,
  currentDate: string = localToday()
): PeriodizationState {
  const start = new Date(startDate + "T00:00:00");
  const current = new Date(currentDate + "T00:00:00");
  const diffMs = current.getTime() - start.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const weekNumber = Math.max(1, Math.floor(diffDays / 7) + 1);

  // Cycle within 12 weeks
  const cycleWeek = ((weekNumber - 1) % 12) + 1;

  if (cycleWeek <= 4) {
    return {
      weekNumber,
      phaseName: "Foundation",
      schedule: "B",
      isDeload: false,
      repRange: "8-15",
      focus: "Movement quality, light loads, habit building",
    };
  }

  if (cycleWeek <= 8) {
    return {
      weekNumber,
      phaseName: "Building",
      schedule: "A",
      isDeload: cycleWeek === 6,
      repRange: "4-8",
      focus: "Heavier loads, add 4th set to main lifts",
    };
  }

  // Weeks 9-12
  return {
    weekNumber,
    phaseName: "Performance",
    schedule: "B",
    isDeload: cycleWeek === 12,
    repRange: "8-15",
    focus: "Test strength gains, full 4×4 VO2max",
  };
}

/**
 * Get the Monday of the week containing the given date.
 */
export function getWeekStart(date: string = localToday()): string {
  const d = new Date(date + "T00:00:00");
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday
  d.setDate(diff);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
