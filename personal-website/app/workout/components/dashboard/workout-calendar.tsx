"use client";

import { useState } from "react";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getDayTemplate } from "../../lib/engine/exercise-bank";
import { localToday } from "../../lib/utils";
import type { Workout } from "../../types/workout";
import type { Bucket } from "../../types/exercise";

const BUCKET_DOT_COLORS: Record<string, string> = {
  zone2_cardio: "bg-bucket-zone2",
  vo2max_intervals: "bg-bucket-vo2max",
  strength_push: "bg-bucket-push",
  strength_pull: "bg-bucket-pull",
  strength_lower: "bg-bucket-lower",
  power: "bg-bucket-power",
  stability_mobility: "bg-bucket-stability",
  rest_days: "bg-bucket-rest",
};

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

interface WorkoutCalendarProps {
  workouts: Workout[];
}

export function WorkoutCalendar({ workouts }: WorkoutCalendarProps) {
  const [viewDate, setViewDate] = useState(() => new Date());

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1));

  // Build map of date -> workouts
  const workoutsByDate = new Map<string, Workout[]>();
  for (const w of workouts) {
    const existing = workoutsByDate.get(w.date) ?? [];
    existing.push(w);
    workoutsByDate.set(w.date, existing);
  }

  // Build calendar grid
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  // Monday = 0 in our grid
  let startDow = firstDay.getDay() - 1;
  if (startDow < 0) startDow = 6;

  const days: Array<{ date: number; dateStr: string; isCurrentMonth: boolean } | null> = [];

  // Pad with nulls for days before the 1st
  for (let i = 0; i < startDow; i++) {
    days.push(null);
  }

  for (let d = 1; d <= lastDay.getDate(); d++) {
    const dateObj = new Date(year, month, d);
    const dateStr = dateObj.toISOString().split("T")[0];
    days.push({ date: d, dateStr, isCurrentMonth: true });
  }

  const today = localToday();
  const monthLabel = firstDay.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <Card className="p-4 bg-card border-border">
      {/* Month header */}
      <div className="flex items-center justify-between mb-3">
        <Button variant="ghost" size="sm" onClick={prevMonth} className="h-7 w-7 p-0">
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm font-medium">{monthLabel}</span>
        <Button variant="ghost" size="sm" onClick={nextMonth} className="h-7 w-7 p-0">
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-0.5 mb-1">
        {DAYS.map((d) => (
          <div key={d} className="text-center text-[10px] text-muted-foreground py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-0.5">
        {days.map((day, i) => {
          if (!day) {
            return <div key={`empty-${i}`} className="aspect-square" />;
          }

          const dayWorkouts = workoutsByDate.get(day.dateStr) ?? [];
          const isToday = day.dateStr === today;
          const hasWorkout = dayWorkouts.length > 0;

          // Collect unique bucket colors from this day's workouts
          const bucketSet = new Set<Bucket>();
          for (const w of dayWorkouts) {
            for (const b of w.bucketsFilled) {
              bucketSet.add(b);
            }
          }
          const buckets = Array.from(bucketSet).slice(0, 4);

          return (
            <div
              key={day.dateStr}
              className={`aspect-square flex flex-col items-center justify-center rounded-md text-xs relative ${
                isToday
                  ? "ring-1 ring-foreground/30"
                  : ""
              } ${
                hasWorkout ? "bg-secondary/50" : ""
              }`}
            >
              <span
                className={`tabular-nums ${
                  isToday ? "font-bold" : "text-muted-foreground"
                }`}
              >
                {day.date}
              </span>
              {buckets.length > 0 && (
                <div className="flex gap-[2px] mt-0.5">
                  {buckets.map((b) => (
                    <div
                      key={b}
                      className={`h-1 w-1 rounded-full ${BUCKET_DOT_COLORS[b] ?? "bg-muted-foreground"}`}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-x-3 gap-y-1 mt-3 justify-center">
        {Object.entries(BUCKET_DOT_COLORS).map(([bucket, colorClass]) => (
          <div key={bucket} className="flex items-center gap-1">
            <div className={`h-1.5 w-1.5 rounded-full ${colorClass}`} />
            <span className="text-[9px] text-muted-foreground">
              {bucket.replace(/_/g, " ").replace("strength ", "")}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}
