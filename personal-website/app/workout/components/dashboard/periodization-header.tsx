"use client";

import type { PeriodizationState } from "../../types/tracking";
import { Badge } from "../../components/ui/badge";

interface PeriodizationHeaderProps {
  phase: PeriodizationState;
}

export function PeriodizationHeader({ phase }: PeriodizationHeaderProps) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Badge variant="secondary" className="text-xs">
        Week {phase.weekNumber}
      </Badge>
      <Badge variant="outline" className="text-xs">
        {phase.phaseName} Phase
      </Badge>
      <Badge variant="outline" className="text-xs">
        Schedule {phase.schedule}
      </Badge>
      {phase.isDeload && (
        <Badge className="bg-bucket-vo2max/20 text-bucket-vo2max border-bucket-vo2max/30 text-xs">
          Deload Week
        </Badge>
      )}
    </div>
  );
}
