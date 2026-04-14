"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Check } from "lucide-react";
import { useSaveCustomExercise } from "../../lib/db/hooks";
import type {
  Exercise,
  Bucket,
  MovementPattern,
  TrainingPillar,
  Equipment,
  DifficultyTier,
  TrackingUnit,
} from "../../types/exercise";

const BUCKETS: { value: Bucket; label: string }[] = [
  { value: "strength_push", label: "Strength: Push" },
  { value: "strength_pull", label: "Strength: Pull" },
  { value: "strength_lower", label: "Strength: Lower" },
  { value: "power", label: "Power" },
  { value: "zone2_cardio", label: "Zone 2 Cardio" },
  { value: "vo2max_intervals", label: "VO2max Intervals" },
  { value: "stability_mobility", label: "Stability & Mobility" },
  { value: "rest_days", label: "Rest Day" },
];

const MOVEMENT_PATTERNS: { value: MovementPattern; label: string }[] = [
  { value: "squat", label: "Squat" },
  { value: "hinge", label: "Hinge" },
  { value: "horizontal_push", label: "Horizontal Push" },
  { value: "vertical_push", label: "Vertical Push" },
  { value: "horizontal_pull", label: "Horizontal Pull" },
  { value: "vertical_pull", label: "Vertical Pull" },
  { value: "carry", label: "Carry" },
  { value: "rotation", label: "Rotation" },
  { value: "locomotion", label: "Locomotion" },
  { value: "core_stabilization", label: "Core Stabilization" },
];

const TRAINING_PILLARS: { value: TrainingPillar; label: string }[] = [
  { value: "strength", label: "Strength" },
  { value: "power", label: "Power" },
  { value: "zone2_cardio", label: "Zone 2 Cardio" },
  { value: "vo2max_interval", label: "VO2max Interval" },
  { value: "stability_mobility", label: "Stability & Mobility" },
];

const EQUIPMENT_OPTIONS: { value: Equipment; label: string }[] = [
  { value: "barbell", label: "Barbell" },
  { value: "dumbbell", label: "Dumbbell" },
  { value: "kettlebell", label: "Kettlebell" },
  { value: "cable_machine", label: "Cable Machine" },
  { value: "bodyweight", label: "Bodyweight" },
  { value: "band", label: "Band" },
  { value: "cardio_machine", label: "Cardio Machine" },
  { value: "none", label: "None" },
];

const TRACKING_UNITS: { value: TrackingUnit; label: string }[] = [
  { value: "weight_reps", label: "Weight + Reps" },
  { value: "duration", label: "Duration" },
  { value: "hr_zone", label: "Heart Rate Zone" },
  { value: "weight_duration", label: "Weight + Duration" },
];

export default function NewExercisePage() {
  const router = useRouter();
  const saveExercise = useSaveCustomExercise();

  const [name, setName] = useState("");
  const [bucket, setBucket] = useState<Bucket>("strength_push");
  const [movementPattern, setMovementPattern] = useState<MovementPattern>("horizontal_push");
  const [trainingPillar, setTrainingPillar] = useState<TrainingPillar>("strength");
  const [equipment, setEquipment] = useState<Equipment>("dumbbell");
  const [trackingUnit, setTrackingUnit] = useState<TrackingUnit>("weight_reps");
  const [difficulty, setDifficulty] = useState<DifficultyTier>("beginner");
  const [sets, setSets] = useState("3");
  const [reps, setReps] = useState("8-12");
  const [rpe, setRpe] = useState("7");
  const [restSec, setRestSec] = useState("90");
  const [notes, setNotes] = useState("");

  const canSave = name.trim().length > 0;

  const handleSave = async () => {
    if (!canSave) return;

    const id = "custom_" + name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "_");

    const prescription = trackingUnit === "weight_reps"
      ? {
          schedule_a: { sets: Number(sets), reps, rest_sec: Number(restSec) },
          schedule_b: { sets: Number(sets), reps, rest_sec: Number(restSec) },
          rpe,
        }
      : {
          schedule_a: { duration_min: reps, hr_zone: "60-70% max HR", rpe },
          schedule_b: { duration_min: reps, hr_zone: "60-70% max HR", rpe },
          rpe,
        };

    const exercise: Exercise = {
      id,
      name: name.trim(),
      bucket: [bucket],
      movement_pattern: movementPattern,
      training_pillar: trainingPillar,
      fiber_type_bias: "mixed",
      compound_isolation: "compound",
      bilateral_unilateral: "bilateral",
      primary_muscles: [],
      secondary_muscles: [],
      equipment: [equipment],
      progression_chain: [id],
      tracking_unit: trackingUnit,
      default_prescription: prescription,
      joint_stress: {},
      longevity_benchmarks: [],
      difficulty_tier: difficulty,
      implicit_core: false,
      notes,
    };

    await saveExercise(exercise);
    router.back();
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">New Exercise</h1>

      <Card className="p-4 bg-card border-border space-y-4">
        {/* Name */}
        <div>
          <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-1">
            Exercise Name *
          </label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Incline Dumbbell Press"
            className="h-9"
            autoFocus
          />
        </div>

        {/* Bucket + Pillar */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-1">
              Bucket
            </label>
            <Select value={bucket} onValueChange={(v) => v && setBucket(v as Bucket)}>
              <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
              <SelectContent>
                {BUCKETS.map((b) => (
                  <SelectItem key={b.value} value={b.value}>{b.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-1">
              Training Pillar
            </label>
            <Select value={trainingPillar} onValueChange={(v) => v && setTrainingPillar(v as TrainingPillar)}>
              <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
              <SelectContent>
                {TRAINING_PILLARS.map((p) => (
                  <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Movement Pattern + Equipment */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-1">
              Movement Pattern
            </label>
            <Select value={movementPattern} onValueChange={(v) => v && setMovementPattern(v as MovementPattern)}>
              <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
              <SelectContent>
                {MOVEMENT_PATTERNS.map((m) => (
                  <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-1">
              Equipment
            </label>
            <Select value={equipment} onValueChange={(v) => v && setEquipment(v as Equipment)}>
              <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
              <SelectContent>
                {EQUIPMENT_OPTIONS.map((e) => (
                  <SelectItem key={e.value} value={e.value}>{e.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Tracking + Difficulty */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-1">
              Tracking
            </label>
            <Select value={trackingUnit} onValueChange={(v) => v && setTrackingUnit(v as TrackingUnit)}>
              <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
              <SelectContent>
                {TRACKING_UNITS.map((t) => (
                  <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-1">
              Difficulty
            </label>
            <Select value={difficulty} onValueChange={(v) => v && setDifficulty(v as DifficultyTier)}>
              <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Prescription */}
        <div className="grid grid-cols-4 gap-2">
          <div>
            <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-1">
              Sets
            </label>
            <Input type="number" inputMode="numeric" value={sets} onChange={(e) => setSets(e.target.value)} className="h-9" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-1">
              {trackingUnit === "weight_reps" ? "Reps" : "Duration"}
            </label>
            <Input value={reps} onChange={(e) => setReps(e.target.value)} className="h-9" placeholder={trackingUnit === "weight_reps" ? "8-12" : "45 min"} />
          </div>
          <div>
            <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-1">
              RPE
            </label>
            <Input value={rpe} onChange={(e) => setRpe(e.target.value)} className="h-9" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-1">
              Rest (s)
            </label>
            <Input type="number" inputMode="numeric" value={restSec} onChange={(e) => setRestSec(e.target.value)} className="h-9" />
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-1">
            Notes (optional)
          </label>
          <Input
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Coaching cues, safety notes..."
            className="h-9"
          />
        </div>
      </Card>

      <Button onClick={handleSave} disabled={!canSave} className="w-full gap-1" size="lg">
        <Check className="h-4 w-4" />
        Save Exercise
      </Button>
    </div>
  );
}
