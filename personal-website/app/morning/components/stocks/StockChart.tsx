"use client";

import { useState, useRef, useCallback } from "react";
import styles from "./stocks.module.css";

interface StockChartProps {
  prices: number[];
  timestamps?: number[]; // unix seconds
  isPositive: boolean;
}

function formatDate(unix: number): string {
  const d = new Date(unix * 1000);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function StockChart({ prices, timestamps, isPositive }: StockChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hover, setHover] = useState<{ x: number; y: number; price: number; date: string } | null>(null);

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
    return { x, y, price, index: i };
  });

  const polylinePoints = points.map((p) => `${p.x},${p.y}`).join(" ");

  const firstX = padding;
  const lastX = padding + (width - padding * 2);
  const areaPoints = `${firstX},${height} ${polylinePoints} ${lastX},${height}`;

  const color = isPositive ? "var(--morning-accent-green)" : "var(--morning-accent-red)";
  const gradientId = `grad-${isPositive ? "green" : "red"}`;

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      const svg = svgRef.current;
      if (!svg) return;
      const rect = svg.getBoundingClientRect();
      const mouseX = ((e.clientX - rect.left) / rect.width) * width;

      // Find closest point
      let closest = points[0];
      let closestDist = Infinity;
      for (const p of points) {
        const dist = Math.abs(p.x - mouseX);
        if (dist < closestDist) {
          closestDist = dist;
          closest = p;
        }
      }

      const date = timestamps?.[closest.index]
        ? formatDate(timestamps[closest.index])
        : "";

      setHover({ x: closest.x, y: closest.y, price: closest.price, date });
    },
    [points, timestamps]
  );

  const handleMouseLeave = useCallback(() => setHover(null), []);

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${width} ${height}`}
      className={styles.chart}
      preserveAspectRatio="none"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
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

      {hover && (
        <>
          {/* Vertical crosshair */}
          <line
            x1={hover.x}
            y1={0}
            x2={hover.x}
            y2={height}
            stroke={color}
            strokeWidth="0.5"
            strokeDasharray="2 2"
            opacity="0.5"
          />
          {/* Horizontal crosshair */}
          <line
            x1={0}
            y1={hover.y}
            x2={width}
            y2={hover.y}
            stroke={color}
            strokeWidth="0.5"
            strokeDasharray="2 2"
            opacity="0.3"
          />
          {/* Dot on the line */}
          <circle
            cx={hover.x}
            cy={hover.y}
            r="2.5"
            fill={color}
          />
          {/* Price label */}
          <text
            x={hover.x > width / 2 ? hover.x - 3 : hover.x + 3}
            y={8}
            textAnchor={hover.x > width / 2 ? "end" : "start"}
            fill="var(--morning-text-primary)"
            fontSize="6"
            fontFamily="var(--morning-font)"
            fontWeight="600"
          >
            ${hover.price.toFixed(2)}
          </text>
          {/* Date label */}
          {hover.date && (
            <text
              x={hover.x > width / 2 ? hover.x - 3 : hover.x + 3}
              y={height - 2}
              textAnchor={hover.x > width / 2 ? "end" : "start"}
              fill="var(--morning-text-secondary)"
              fontSize="5"
              fontFamily="var(--morning-font)"
            >
              {hover.date}
            </text>
          )}
        </>
      )}
    </svg>
  );
}
