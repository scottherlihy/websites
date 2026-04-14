"use client";

import { useState } from "react";
import type { StockQuote, StockCandle, StockFundamentals } from "../../../lib/types";
import { useRange } from "./RangeContext";
import StockChart from "./StockChart";
import styles from "./stocks.module.css";

interface StockCardDisplayProps {
  symbol: string;
  quote: StockQuote;
  fundamentals: StockFundamentals;
  candles: Record<string, StockCandle>;
}

function formatLargeNumber(n: number): string {
  if (n >= 1000) return `$${(n / 1000).toFixed(1)}B`;
  if (n > 0) return `$${n.toFixed(0)}M`;
  return "N/A";
}

function formatRevenue(n: number): string {
  if (n >= 1000) return `$${(n / 1000).toFixed(2)}B`;
  if (n > 0) return `$${n.toFixed(0)}M`;
  return "Pre-revenue";
}

export default function StockCardDisplay({
  symbol,
  quote,
  fundamentals,
  candles,
}: StockCardDisplayProps) {
  const range = useRange();
  const [flipped, setFlipped] = useState(false);
  const candle = candles[range];
  const prices = candle?.c ?? [];

  let changeValue: number;
  let changePercent: number;

  if (range === "1D") {
    changeValue = quote.d;
    changePercent = quote.dp;
  } else if (prices.length >= 2) {
    const first = prices[0];
    const last = prices[prices.length - 1];
    changeValue = last - first;
    changePercent = (changeValue / first) * 100;
  } else {
    changeValue = quote.d;
    changePercent = quote.dp;
  }

  const isPositive = changeValue >= 0;

  return (
    <div
      className={`${styles.flipContainer} ${flipped ? styles.flipped : ""}`}
      onClick={() => setFlipped(!flipped)}
    >
      <div className={styles.flipInner}>
        {/* Front - Chart */}
        <div className={styles.flipFront}>
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <span className={styles.symbol}>{symbol}</span>
              <span className={styles.price}>${quote.c.toFixed(2)}</span>
            </div>
            <div className={styles.change}>
              <span className={isPositive ? styles.positive : styles.negative}>
                {isPositive ? "+" : ""}
                {changeValue.toFixed(2)} ({isPositive ? "+" : ""}
                {changePercent.toFixed(2)}%)
              </span>
            </div>
            <StockChart prices={prices} timestamps={candle?.t} isPositive={isPositive} />
          </div>
        </div>

        {/* Back - Fundamentals */}
        <div className={styles.flipBack}>
          <div className={styles.cardBack}>
            <span className={styles.symbol}>{symbol}</span>
            <div className={styles.fundamentals}>
              <div className={styles.fundRow}>
                <span className={styles.fundLabel}>Market Cap</span>
                <span className={styles.fundValue}>
                  {formatLargeNumber(fundamentals.marketCap)}
                </span>
              </div>
              <div className={styles.fundRow}>
                <span className={styles.fundLabel}>Revenue TTM</span>
                <span className={styles.fundValue}>
                  {formatRevenue(fundamentals.revenueTTM)}
                </span>
              </div>
              <div className={styles.fundRow}>
                <span className={styles.fundLabel}>Rev Growth YoY</span>
                <span className={styles.fundValue}>
                  {fundamentals.revenueLastQ
                    ? `${(fundamentals.revenueLastQ * 100).toFixed(1)}%`
                    : "N/A"}
                </span>
              </div>
              <div className={styles.fundRow}>
                <span className={styles.fundLabel}>Next Earnings</span>
                <span className={styles.fundValue}>
                  {fundamentals.nextEarningsDate}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
