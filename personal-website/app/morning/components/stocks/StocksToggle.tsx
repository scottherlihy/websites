"use client";

import { useState } from "react";
import type { StockRange } from "../../../lib/constants";
import { RangeContext } from "./RangeContext";
import styles from "./stocks.module.css";

const RANGES: StockRange[] = ["1D", "1M", "1Y"];

export default function StocksToggle({
  children,
}: {
  children: React.ReactNode;
}) {
  const [range, setRange] = useState<StockRange>("1M");

  return (
    <RangeContext value={range}>
      <div className={styles.toggleRow}>
        {RANGES.map((r) => (
          <button
            key={r}
            className={`${styles.toggleBtn} ${r === range ? styles.toggleActive : ""}`}
            onClick={() => setRange(r)}
          >
            {r}
          </button>
        ))}
      </div>
      {children}
    </RangeContext>
  );
}
