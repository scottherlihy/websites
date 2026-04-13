"use client";

import { useState, useEffect } from "react";
import styles from "./header.module.css";

interface SunArcProps {
  sunrise: string;
  sunset: string;
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Europe/Amsterdam",
  });
}

export default function SunArc({ sunrise, sunset }: SunArcProps) {
  const [progress, setProgress] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    function update() {
      const now = Date.now();
      const rise = new Date(sunrise).getTime();
      const set = new Date(sunset).getTime();
      const total = set - rise;
      if (total <= 0) {
        setProgress(0);
        return;
      }
      const elapsed = now - rise;
      setProgress(Math.max(0, Math.min(1, elapsed / total)));
    }
    update();
    setMounted(true);
    const interval = setInterval(update, 60000); // update every minute
    return () => clearInterval(interval);
  }, [sunrise, sunset]);

  // Arc geometry — viewBox starts at y=-15 so the arc peak isn't clipped
  const width = 160;
  const height = 85;
  const viewY = -15;
  const arcY = 60;
  const arcRadius = 68;
  const startX = 10;
  const endX = width - 10;
  const midX = width / 2;

  // Sun position along the arc (parametric semicircle)
  const angle = Math.PI * (1 - progress); // pi to 0 (left to right)
  const sunX = midX + arcRadius * Math.cos(angle);
  const sunY = arcY - arcRadius * Math.abs(Math.sin(angle));

  const isDaytime = progress > 0 && progress < 1;

  return (
    <div className={styles.sunArc} suppressHydrationWarning>
      <svg
        viewBox={`0 ${viewY} ${width} ${height}`}
        className={styles.sunSvg}
      >
        <defs>
          {/* Glow filter for the sun */}
          <filter id="sunGlow" x="-100%" y="-100%" width="400%" height="400%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          {/* Gradient for the arc path */}
          <linearGradient id="arcGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="var(--morning-accent-orange)" stopOpacity="0.15" />
            <stop offset="50%" stopColor="var(--morning-accent-orange)" stopOpacity="0.4" />
            <stop offset="100%" stopColor="var(--morning-accent-orange)" stopOpacity="0.15" />
          </linearGradient>
          {/* Sun radial gradient */}
          <radialGradient id="sunFill">
            <stop offset="0%" stopColor="#ffe066" />
            <stop offset="100%" stopColor="var(--morning-accent-orange)" />
          </radialGradient>
        </defs>

        {/* Horizon line */}
        <line
          x1={startX}
          y1={arcY}
          x2={endX}
          y2={arcY}
          stroke="var(--morning-border)"
          strokeWidth="1"
        />

        {/* Dashed arc path */}
        <path
          d={`M ${startX} ${arcY} A ${arcRadius} ${arcRadius} 0 0 1 ${endX} ${arcY}`}
          fill="none"
          stroke="url(#arcGrad)"
          strokeWidth="1"
          strokeDasharray="3 3"
        />

        {/* Traveled arc (solid) */}
        {mounted && isDaytime && (
          <path
            d={`M ${startX} ${arcY} A ${arcRadius} ${arcRadius} 0 0 1 ${sunX} ${sunY}`}
            fill="none"
            stroke="var(--morning-accent-orange)"
            strokeWidth="1.5"
            strokeOpacity="0.6"
            className={styles.traveledArc}
          />
        )}

        {/* Sun dot */}
        {mounted && isDaytime && (
          <g filter="url(#sunGlow)">
            <circle
              cx={sunX}
              cy={sunY}
              r="5"
              fill="url(#sunFill)"
              className={styles.sunDot}
            />
          </g>
        )}

        {/* Below horizon indicator when night */}
        {mounted && !isDaytime && (
          <circle
            cx={midX}
            cy={arcY + 8}
            r="3"
            fill="var(--morning-text-muted)"
            opacity="0.5"
          />
        )}
      </svg>

      <div className={styles.sunTimes}>
        <span className={styles.sunTime}>
          <span className={styles.sunIcon}>↑</span> {formatTime(sunrise)}
        </span>
        <span className={styles.sunTime}>
          <span className={styles.sunIcon}>↓</span> {formatTime(sunset)}
        </span>
      </div>
    </div>
  );
}
