"use client";

import { useState } from "react";
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
import { localToday } from "../../lib/utils";
import { useSaveBenchmarkTest } from "../../lib/db/hooks";
import { getBenchmarkDefinitions } from "../../lib/engine/exercise-bank";

export function BenchmarkTestForm() {
  const saveBenchmark = useSaveBenchmarkTest();
  const definitions = getBenchmarkDefinitions();

  const [benchmarkId, setBenchmarkId] = useState("");
  const [value, setValue] = useState("");
  const [notes, setNotes] = useState("");
  const [saved, setSaved] = useState(false);

  const selectedDef = benchmarkId ? definitions[benchmarkId] : null;

  const handleSave = async () => {
    if (!benchmarkId || !value) return;
    const today = localToday();
    await saveBenchmark({
      date: today,
      benchmarkId,
      value: Number(value),
      unit: selectedDef?.unit ?? "",
      notes: notes || undefined,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    setValue("");
    setNotes("");
  };

  return (
    <Card className="p-4 bg-card border-border space-y-3">
      <h3 className="text-sm font-medium">Log Benchmark Test</h3>

      <div>
        <label className="text-[10px] text-muted-foreground uppercase">Benchmark</label>
        <Select value={benchmarkId} onValueChange={(v) => v && setBenchmarkId(v)}>
          <SelectTrigger className="w-full mt-1">
            <SelectValue placeholder="Select benchmark..." />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(definitions).map(([id, def]) => (
              <SelectItem key={id} value={id}>
                {def.label} ({def.unit})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedDef && (
        <>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-[10px] text-muted-foreground uppercase">
                Value ({selectedDef.unit})
              </label>
              <Input
                type="number"
                inputMode="decimal"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="0"
                className="h-9 mt-1"
              />
            </div>
            <div className="text-right pt-5">
              <p className="text-[10px] text-muted-foreground">
                Target: {selectedDef.target}
              </p>
            </div>
          </div>

          <div>
            <label className="text-[10px] text-muted-foreground uppercase">Notes (optional)</label>
            <Input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. tested after warmup"
              className="h-9 mt-1"
            />
          </div>
        </>
      )}

      <Button
        onClick={handleSave}
        disabled={!benchmarkId || !value}
        className="w-full gap-1"
        size="sm"
      >
        {saved ? (
          <>
            <Check className="h-3.5 w-3.5" />
            Saved
          </>
        ) : (
          "Save Test Result"
        )}
      </Button>
    </Card>
  );
}
