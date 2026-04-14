"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "../../components/ui/sheet";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Plus } from "lucide-react";
import { getAllExercises } from "../../lib/engine/exercise-bank";
import type { Exercise, Equipment, DifficultyTier, Bucket } from "../../types/exercise";

interface ExercisePickerSheetProps {
  open: boolean;
  onClose: () => void;
  onSelect: (exerciseId: string) => void;
  title?: string;
  equipment?: Equipment[];
  difficultyTier?: DifficultyTier;
  /** If set, prioritize exercises from this bucket at the top */
  preferBucket?: Bucket;
  /** Exercise IDs to exclude (already in workout) */
  excludeIds?: string[];
}

const PILLAR_LABELS: Record<string, string> = {
  strength: "Strength",
  zone2_cardio: "Zone 2 Cardio",
  vo2max_interval: "VO2max",
  stability_mobility: "Stability & Mobility",
  power: "Power",
};

export function ExercisePickerSheet({
  open,
  onClose,
  onSelect,
  title = "Add Exercise",
  equipment,
  difficultyTier,
  preferBucket,
  excludeIds = [],
}: ExercisePickerSheetProps) {
  const [search, setSearch] = useState("");

  const allExercises = getAllExercises();
  const tierOrder: DifficultyTier[] = ["beginner", "intermediate", "advanced"];
  const maxTierIdx = difficultyTier ? tierOrder.indexOf(difficultyTier) : 2;

  // Filter
  const filtered = allExercises.filter((ex) => {
    if (excludeIds.includes(ex.id)) return false;
    if (equipment && !ex.equipment.some((eq) => equipment.includes(eq))) return false;
    if (tierOrder.indexOf(ex.difficulty_tier) > maxTierIdx) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        ex.name.toLowerCase().includes(q) ||
        ex.bucket.some((b) => b.includes(q)) ||
        ex.movement_pattern.includes(q) ||
        ex.primary_muscles.some((m) => m.includes(q))
      );
    }
    return true;
  });

  // Group by training pillar, with preferred bucket's exercises first
  const preferred: Exercise[] = [];
  const rest: Exercise[] = [];
  for (const ex of filtered) {
    if (preferBucket && ex.bucket.includes(preferBucket)) {
      preferred.push(ex);
    } else {
      rest.push(ex);
    }
  }

  // Group rest by pillar
  const byPillar = new Map<string, Exercise[]>();
  for (const ex of rest) {
    const group = byPillar.get(ex.training_pillar) ?? [];
    group.push(ex);
    byPillar.set(ex.training_pillar, group);
  }

  return (
    <Sheet open={open} onOpenChange={(v) => { if (!v) { onClose(); setSearch(""); } }}>
      <SheetContent side="bottom" className="max-h-[80vh] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-left">{title}</SheetTitle>
        </SheetHeader>

        <div className="mt-3 mb-4 flex gap-2">
          <Input
            placeholder="Search exercises..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 flex-1"
            autoFocus
          />
          <Link href="/exercises/new" onClick={onClose}>
            <Button variant="outline" size="sm" className="h-9 gap-1 shrink-0">
              <Plus className="h-3.5 w-3.5" />
              New
            </Button>
          </Link>
        </div>

        <div className="space-y-4 pb-4">
          {preferred.length > 0 && (
            <div>
              <h4 className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
                {preferBucket?.replace(/_/g, " ") ?? "Suggested"}
              </h4>
              <div className="space-y-1">
                {preferred.map((ex) => (
                  <ExerciseRow key={ex.id} exercise={ex} onSelect={onSelect} />
                ))}
              </div>
            </div>
          )}

          {Array.from(byPillar.entries()).map(([pillar, exercises]) => (
            <div key={pillar}>
              <h4 className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
                {PILLAR_LABELS[pillar] ?? pillar}
              </h4>
              <div className="space-y-1">
                {exercises.map((ex) => (
                  <ExerciseRow key={ex.id} exercise={ex} onSelect={onSelect} />
                ))}
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              No exercises match your search.
            </p>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

function ExerciseRow({
  exercise,
  onSelect,
}: {
  exercise: Exercise;
  onSelect: (id: string) => void;
}) {
  return (
    <Button
      variant="ghost"
      className="w-full justify-start h-auto py-2 px-3"
      onClick={() => onSelect(exercise.id)}
    >
      <div className="text-left">
        <p className="text-sm font-medium">{exercise.name}</p>
        <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
          <Badge variant="outline" className="text-[10px] px-1 py-0">
            {exercise.difficulty_tier}
          </Badge>
          {exercise.bucket.map((b) => (
            <span key={b} className="text-[10px] text-muted-foreground">
              {b.replace(/_/g, " ").replace("strength ", "")}
            </span>
          ))}
          <span className="text-[10px] text-muted-foreground/60">
            {exercise.equipment[0]}
          </span>
        </div>
      </div>
    </Button>
  );
}
