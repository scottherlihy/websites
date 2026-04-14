"use client";

import { useState } from "react";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Check } from "lucide-react";
import { localToday } from "../../lib/utils";
import { useSaveBodyMetric } from "../../lib/db/hooks";

export function BodyMetricForm() {
  const saveMetric = useSaveBodyMetric();
  const [weight, setWeight] = useState("");
  const [bodyFat, setBodyFat] = useState("");
  const [restingHR, setRestingHR] = useState("");
  const [hrv, setHrv] = useState("");
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    const today = localToday();
    await saveMetric({
      date: today,
      weight: weight ? Number(weight) : undefined,
      bodyFat: bodyFat ? Number(bodyFat) : undefined,
      restingHR: restingHR ? Number(restingHR) : undefined,
      hrv: hrv ? Number(hrv) : undefined,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    setWeight("");
    setBodyFat("");
    setRestingHR("");
    setHrv("");
  };

  const hasAnyValue = weight || bodyFat || restingHR || hrv;

  return (
    <Card className="p-4 bg-card border-border space-y-3">
      <h3 className="text-sm font-medium">Log Body Metrics</h3>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-[10px] text-muted-foreground uppercase">Weight (kg)</label>
          <Input
            type="number"
            inputMode="decimal"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder="0"
            className="h-9 mt-1"
          />
        </div>
        <div>
          <label className="text-[10px] text-muted-foreground uppercase">Body Fat %</label>
          <Input
            type="number"
            inputMode="decimal"
            value={bodyFat}
            onChange={(e) => setBodyFat(e.target.value)}
            placeholder="0"
            className="h-9 mt-1"
          />
        </div>
        <div>
          <label className="text-[10px] text-muted-foreground uppercase">Resting HR (bpm)</label>
          <Input
            type="number"
            inputMode="numeric"
            value={restingHR}
            onChange={(e) => setRestingHR(e.target.value)}
            placeholder="0"
            className="h-9 mt-1"
          />
        </div>
        <div>
          <label className="text-[10px] text-muted-foreground uppercase">HRV (ms)</label>
          <Input
            type="number"
            inputMode="numeric"
            value={hrv}
            onChange={(e) => setHrv(e.target.value)}
            placeholder="0"
            className="h-9 mt-1"
          />
        </div>
      </div>

      <Button
        onClick={handleSave}
        disabled={!hasAnyValue}
        className="w-full gap-1"
        size="sm"
      >
        {saved ? (
          <>
            <Check className="h-3.5 w-3.5" />
            Saved
          </>
        ) : (
          "Save Metrics"
        )}
      </Button>
    </Card>
  );
}
