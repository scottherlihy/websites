"use client";

import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Dumbbell, Plus } from "lucide-react";
import { getTemplateOptions } from "../../lib/engine/workout-generator";

interface GeneratorFormProps {
  selectedTemplate: string;
  onTemplateChange: (id: string) => void;
  selectedDate: string;
  onDateChange: (date: string) => void;
  availableTime: string;
  onTimeChange: (minutes: string) => void;
  onGenerate: () => void;
  isHistorical?: boolean;
  onStartManualBuild?: () => void;
}

export function GeneratorForm({
  selectedTemplate,
  onTemplateChange,
  selectedDate,
  onDateChange,
  availableTime,
  onTimeChange,
  onGenerate,
  isHistorical,
  onStartManualBuild,
}: GeneratorFormProps) {
  const templates = getTemplateOptions();

  return (
    <Card className="p-4 bg-card border-border space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-2">
            Date
          </label>
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => onDateChange(e.target.value)}
            className="h-9"
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-2">
            Available Time
          </label>
          <div className="relative">
            <Input
              type="number"
              inputMode="numeric"
              value={availableTime}
              onChange={(e) => onTimeChange(e.target.value)}
              placeholder="Any"
              className="h-9 pr-10"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
              min
            </span>
          </div>
        </div>
      </div>

      {!isHistorical && (
        <>
          <div>
            <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-2">
              Workout Type
            </label>
            <Select value={selectedTemplate} onValueChange={(v) => v && onTemplateChange(v)}>
              <SelectTrigger className="w-full h-9">
                <SelectValue placeholder="Auto" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="auto">Auto (based on what you need)</SelectItem>
                {templates.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.label} (~{t.estimatedMinutes} min)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button onClick={onGenerate} className="w-full gap-2">
            <Dumbbell className="h-4 w-4" />
            Generate Workout
          </Button>
        </>
      )}

      {isHistorical && (
        <>
          <p className="text-xs text-muted-foreground">
            Logging a past workout — build it manually or start from a template.
          </p>
          <div className="flex gap-2">
            <Button onClick={onStartManualBuild} variant="default" className="flex-1 gap-1">
              <Plus className="h-4 w-4" />
              Build Manually
            </Button>
            <Select value={selectedTemplate} onValueChange={(v) => { if (v) { onTemplateChange(v); onGenerate(); } }}>
              <SelectTrigger className="flex-1 h-9">
                <SelectValue placeholder="Start from template..." />
              </SelectTrigger>
              <SelectContent>
                {templates.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </>
      )}
    </Card>
  );
}
