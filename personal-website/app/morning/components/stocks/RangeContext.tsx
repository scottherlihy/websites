"use client";

import { createContext, useContext } from "react";
import type { StockRange } from "../../../lib/constants";

export const RangeContext = createContext<StockRange>("1M");

export function useRange() {
  return useContext(RangeContext);
}
