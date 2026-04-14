"use client";

import { Card } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { getBenchmarkDefinitions } from "../../lib/engine/exercise-bank";
import type { BenchmarkTest } from "../../types/tracking";

interface BenchmarkGridProps {
  tests: BenchmarkTest[];
}

export function BenchmarkGrid({ tests }: BenchmarkGridProps) {
  const definitions = getBenchmarkDefinitions();

  // Group tests by benchmark, get latest value per benchmark
  const latestByBenchmark = new Map<string, BenchmarkTest>();
  for (const test of tests) {
    const existing = latestByBenchmark.get(test.benchmarkId);
    if (!existing || test.date > existing.date) {
      latestByBenchmark.set(test.benchmarkId, test);
    }
  }

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium">Longevity Benchmarks</h3>
      <div className="grid grid-cols-2 gap-2">
        {Object.entries(definitions).map(([id, def]) => {
          const latest = latestByBenchmark.get(id);
          const hasData = !!latest;

          return (
            <Card key={id} className="p-3 bg-card border-border">
              <p className="text-xs font-medium truncate">{def.label}</p>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-lg font-bold tabular-nums">
                  {hasData ? latest.value : "—"}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  {def.unit}
                </span>
              </div>
              <div className="flex items-center gap-1 mt-1">
                <Badge
                  variant="outline"
                  className="text-[9px] px-1 py-0"
                >
                  target: {def.target}
                </Badge>
              </div>
              <p className="text-[9px] text-muted-foreground/60 mt-1">
                {def.test_frequency}
              </p>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
