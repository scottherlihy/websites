"use client";

import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { CheckCircle2, Clock } from "lucide-react";
import { useWorkouts } from "../lib/db/hooks";
import { getDayTemplate } from "../lib/engine/exercise-bank";

export default function HistoryPage() {
  const workouts = useWorkouts();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">History</h1>

      {workouts.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-10">
          No workouts logged yet. Generate and complete your first workout to see it here.
        </p>
      ) : (
        <div className="space-y-2">
          {workouts.map((workout) => {
            const template = getDayTemplate(workout.templateId);
            return (
              <Card key={workout.id} className="p-4 bg-card border-border">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    {workout.status === "completed" ? (
                      <CheckCircle2 className="h-5 w-5 text-bucket-stability mt-0.5" />
                    ) : (
                      <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                    )}
                    <div>
                      <p className="font-medium text-sm">
                        {template?.label ?? workout.templateId}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {formatDate(workout.date)}
                        {workout.duration ? ` · ${workout.duration} min` : ""}
                      </p>
                      <div className="flex gap-1 mt-1.5 flex-wrap">
                        {workout.bucketsFilled.map((bucket) => (
                          <Badge
                            key={bucket}
                            variant="outline"
                            className="text-[10px] px-1.5 py-0"
                          >
                            {bucket.replace(/_/g, " ").replace("strength ", "")}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  <Badge
                    variant={workout.status === "completed" ? "secondary" : "outline"}
                    className="text-[10px]"
                  >
                    {workout.phase} · {workout.schedule}
                  </Badge>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

function formatDate(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
}
