"use client";

import { Card } from "../../components/ui/card";
import { CheckCircle2, Clock } from "lucide-react";
import type { Workout } from "../../types/workout";
import { getDayTemplate } from "../../lib/engine/exercise-bank";

interface RecentWorkoutsProps {
  workouts: Workout[];
}

export function RecentWorkouts({ workouts }: RecentWorkoutsProps) {
  if (workouts.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground text-sm">
        No workouts logged yet. Generate your first workout to get started.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {workouts.slice(0, 5).map((workout) => {
        const template = getDayTemplate(workout.templateId);
        return (
          <Card key={workout.id} className="p-3 bg-card border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {workout.status === "completed" ? (
                  <CheckCircle2 className="h-4 w-4 text-bucket-stability" />
                ) : (
                  <Clock className="h-4 w-4 text-muted-foreground" />
                )}
                <div>
                  <p className="text-sm font-medium">
                    {template?.label ?? workout.templateId}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(workout.date)}
                    {workout.duration ? ` · ${workout.duration} min` : ""}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

function formatDate(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}
