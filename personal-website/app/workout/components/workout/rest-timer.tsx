"use client";

import { useState, useEffect } from "react";
import { Button } from "../../components/ui/button";
import { X } from "lucide-react";
import { useActiveWorkout } from "../../stores/active-workout";

export function RestTimer() {
  const restTimerEnd = useActiveWorkout((s) => s.restTimerEnd);
  const clearRestTimer = useActiveWorkout((s) => s.clearRestTimer);
  const [remaining, setRemaining] = useState(0);

  useEffect(() => {
    if (!restTimerEnd) {
      setRemaining(0);
      return;
    }

    const tick = () => {
      const diff = Math.max(0, restTimerEnd - Date.now());
      setRemaining(Math.ceil(diff / 1000));
      if (diff <= 0) clearRestTimer();
    };

    tick();
    const interval = setInterval(tick, 200);
    return () => clearInterval(interval);
  }, [restTimerEnd, clearRestTimer]);

  if (!restTimerEnd || remaining <= 0) return null;

  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-secondary/95 backdrop-blur border-b border-border p-3">
      <div className="mx-auto max-w-lg flex items-center justify-between">
        <span className="text-xs text-muted-foreground uppercase tracking-wider">
          Rest
        </span>
        <span className="text-2xl font-bold tabular-nums">
          {minutes}:{seconds.toString().padStart(2, "0")}
        </span>
        <Button variant="ghost" size="sm" onClick={clearRestTimer} className="h-8 w-8 p-0">
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
