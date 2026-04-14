"use client";

import { Separator } from "../components/ui/separator";
import { BodyMetricForm } from "../components/metrics/body-metric-form";
import { BenchmarkTestForm } from "../components/metrics/benchmark-test-form";

export default function MetricsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Metrics</h1>

      <BodyMetricForm />

      <Separator />

      <BenchmarkTestForm />
    </div>
  );
}
