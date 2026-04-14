"use client";

import { useState, createContext, useContext } from "react";
import type { StockRange } from "../lib/constants";

export const RangeCtx = createContext<StockRange>("1M");
export function useRange() { return useContext(RangeCtx); }

const RANGES: StockRange[] = ["1D", "1M", "1Y"];

export default function StockToggleTw({ children }: { children: React.ReactNode }) {
  const [range, setRange] = useState<StockRange>("1D");

  return (
    <RangeCtx value={range}>
      <div className="flex gap-1 mb-3">
        {RANGES.map((r) => (
          <button
            key={r}
            onClick={() => setRange(r)}
            className={`px-3 py-1 rounded-md text-[0.65rem] font-semibold tracking-wide border-none cursor-pointer transition-colors ${
              r === range
                ? "bg-[#222d40] text-[#d0d7e2]"
                : "bg-transparent text-[#3f4c5e] hover:text-[#d0d7e2]"
            }`}
          >
            {r}
          </button>
        ))}
      </div>
      {children}
    </RangeCtx>
  );
}
