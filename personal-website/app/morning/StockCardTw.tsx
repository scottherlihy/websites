"use client";

import { useState } from "react";
import type { StockQuote, StockCandle, StockFundamentals } from "../lib/types";
import { useRange } from "./StockToggleTw";

interface Props {
  symbol: string;
  quote: StockQuote;
  fundamentals: StockFundamentals;
  candles: Record<string, StockCandle | null>;
}

function fmtBig(n: number) { return n >= 1000 ? `$${(n / 1000).toFixed(1)}B` : n > 0 ? `$${n.toFixed(0)}M` : "N/A"; }
function fmtRev(n: number) { return n >= 1000 ? `$${(n / 1000).toFixed(2)}B` : n > 0 ? `$${n.toFixed(0)}M` : "Pre-revenue"; }

export default function StockCardTw({ symbol, quote, fundamentals, candles }: Props) {
  const range = useRange();
  const [flipped, setFlipped] = useState(false);
  const candle = candles[range];
  const prices = candle?.c ?? [];

  let changeValue: number, changePercent: number;
  if (range === "1D") { changeValue = quote.d; changePercent = quote.dp; }
  else if (prices.length >= 2) { const f = prices[0], l = prices[prices.length - 1]; changeValue = l - f; changePercent = (changeValue / f) * 100; }
  else { changeValue = quote.d; changePercent = quote.dp; }

  const pos = changeValue >= 0;

  // Pre/post market data
  const isPre = quote.marketState === "PRE";
  const isPost = quote.marketState === "POST";
  const extendedPrice = isPre ? quote.preMarketPrice : isPost ? quote.postMarketPrice : null;
  const extendedChange = isPre ? quote.preMarketChange : isPost ? quote.postMarketChange : null;
  const extendedChangePct = isPre ? quote.preMarketChangePercent : isPost ? quote.postMarketChangePercent : null;
  const extendedPos = (extendedChange ?? 0) >= 0;
  const extendedLabel = isPre ? "Pre" : isPost ? "Post" : "";

  return (
    <div
      className="cursor-pointer"
      style={{ perspective: 800 }}
      onClick={() => setFlipped(!flipped)}
    >
      <div
        className="relative transition-transform duration-500"
        style={{ transformStyle: "preserve-3d", transform: flipped ? "rotateY(180deg)" : "none" }}
      >
        {/* Front */}
        <div style={{ backfaceVisibility: "hidden" }}>
          <div className="bg-[#1a2333] rounded-lg p-3 flex flex-col gap-2">
            <div className="flex justify-between items-baseline">
              <span className="text-sm font-bold text-[#d0d7e2] tracking-wide">{symbol}</span>
              <div className="flex items-baseline gap-2">
                {extendedPrice && (
                  <span className={`text-[0.6rem] ${extendedPos ? "text-emerald-400/70" : "text-red-400/70"}`}>
                    {extendedLabel} ${extendedPrice.toFixed(2)}
                  </span>
                )}
                <span className="text-sm font-semibold text-[#d0d7e2]">${quote.c.toFixed(2)}</span>
              </div>
            </div>
            <div className="text-right">
              <span className={`text-xs font-medium ${pos ? "text-emerald-400" : "text-red-400"}`}>
                {pos ? "+" : ""}{changeValue.toFixed(2)} ({pos ? "+" : ""}{changePercent.toFixed(2)}%)
              </span>
            </div>
            <svg viewBox="0 0 200 50" className="w-full h-[50px]" preserveAspectRatio="none">
              {prices.length >= 2 && (() => {
                const min = Math.min(...prices), max = Math.max(...prices), range = max - min || 1;
                const pts = prices.map((p, i) => `${2 + (i / (prices.length - 1)) * 196},${2 + (1 - (p - min) / range) * 46}`).join(" ");
                const color = pos ? "var(--morning-accent-green, #34d399)" : "var(--morning-accent-red, #f87171)";
                return <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />;
              })()}
            </svg>
          </div>
        </div>

        {/* Back */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          <div className="bg-[#1a2333] rounded-lg p-2.5 flex flex-col gap-1 h-full">
            <span className="text-sm font-bold text-[#d0d7e2] tracking-wide">{symbol}</span>
            <div className="flex flex-col gap-1 flex-1 justify-center">
              {[
                ["Market Cap", fmtBig(fundamentals.marketCap)],
                ["Revenue TTM", fmtRev(fundamentals.revenueTTM)],
                ["Rev Growth YoY", fundamentals.revenueLastQ ? `${(fundamentals.revenueLastQ * 100).toFixed(1)}%` : "N/A"],
                ["Next Earnings", fundamentals.nextEarningsDate],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between items-baseline">
                  <span className="text-[0.6rem] text-[#3f4c5e]">{label}</span>
                  <span className="text-[0.65rem] font-semibold text-[#d0d7e2]">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
