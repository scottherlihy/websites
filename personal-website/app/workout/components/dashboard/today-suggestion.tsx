"use client";

import Link from "next/link";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Dumbbell, ArrowRight } from "lucide-react";
import type { WeeklyBucketProgress } from "../../types/tracking";
import type { Bucket } from "../../types/exercise";
import { getDayTemplates } from "../../lib/engine/exercise-bank";

const BUCKET_COLORS: Record<string, string> = {
  zone2_cardio: "bg-bucket-zone2/20 text-bucket-zone2",
  vo2max_intervals: "bg-bucket-vo2max/20 text-bucket-vo2max",
  strength_push: "bg-bucket-push/20 text-bucket-push",
  strength_pull: "bg-bucket-pull/20 text-bucket-pull",
  strength_lower: "bg-bucket-lower/20 text-bucket-lower",
  power: "bg-bucket-power/20 text-bucket-power",
  stability_mobility: "bg-bucket-stability/20 text-bucket-stability",
  rest_days: "bg-bucket-rest/20 text-bucket-rest",
};

interface TodaySuggestionProps {
  progress: WeeklyBucketProgress;
}

export function TodaySuggestion({ progress }: TodaySuggestionProps) {
  const suggested = getSuggestedTemplate(progress);
  const templates = getDayTemplates();
  const template = suggested ? templates[suggested] : null;

  if (!template) {
    return (
      <Card className="p-4 bg-card border-border">
        <p className="text-muted-foreground text-sm">
          All buckets filled for this week. Rest up!
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-4 bg-card border-border">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
            Suggested for today
          </p>
          <h3 className="font-semibold text-sm">{template.label}</h3>
          <p className="text-xs text-muted-foreground mt-1">
            ~{template.estimated_duration_min} min
          </p>
          <div className="flex gap-1.5 mt-2 flex-wrap">
            {template.buckets_filled.map((bucket) => (
              <span
                key={bucket}
                className={`text-[10px] px-1.5 py-0.5 rounded-full ${BUCKET_COLORS[bucket] ?? "bg-muted text-muted-foreground"}`}
              >
                {bucket.replace(/_/g, " ").replace("strength ", "")}
              </span>
            ))}
          </div>
        </div>
        <Link href={`/generate?template=${suggested}`}>
          <Button size="sm" className="gap-1">
            <Dumbbell className="h-3.5 w-3.5" />
            Start
            <ArrowRight className="h-3 w-3" />
          </Button>
        </Link>
      </div>
    </Card>
  );
}

function getSuggestedTemplate(progress: WeeklyBucketProgress): string | null {
  const templates = getDayTemplates();
  let bestId: string | null = null;
  let bestScore = -1;

  for (const [id, template] of Object.entries(templates)) {
    let score = 0;
    for (const bucket of template.buckets_filled) {
      const bp = progress[bucket as Bucket];
      if (bp && bp.percentage < 100) {
        score += (100 - bp.percentage) / 100;
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestId = id;
    }
  }

  return bestScore > 0 ? bestId : null;
}
