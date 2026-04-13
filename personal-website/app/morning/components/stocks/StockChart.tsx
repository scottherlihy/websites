"use client";

import styles from "./stocks.module.css";

interface StockChartProps {
  prices: number[];
  isPositive: boolean;
}

export default function StockChart({ prices, isPositive }: StockChartProps) {
  if (prices.length < 2) return null;

  const width = 200;
  const height = 50;
  const padding = 2;

  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const range = max - min || 1;

  const points = prices.map((price, i) => {
    const x = padding + (i / (prices.length - 1)) * (width - padding * 2);
    const y = padding + (1 - (price - min) / range) * (height - padding * 2);
    return `${x},${y}`;
  });

  const polylinePoints = points.join(" ");

  // Area fill: close the path along the bottom
  const firstX = padding;
  const lastX = padding + ((prices.length - 1) / (prices.length - 1)) * (width - padding * 2);
  const areaPoints = `${firstX},${height} ${polylinePoints} ${lastX},${height}`;

  const color = isPositive ? "var(--morning-accent-green)" : "var(--morning-accent-red)";
  const gradientId = `grad-${isPositive ? "green" : "red"}`;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={styles.chart}
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <polygon points={areaPoints} fill={`url(#${gradientId})`} />
      <polyline
        points={polylinePoints}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
        filter="url(#glow)"
      />
    </svg>
  );
}
