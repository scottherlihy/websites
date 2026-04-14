"use client";

import { useState, useEffect } from "react";

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
      if (total <= 0) { setProgress(0); return; }
      setProgress(Math.max(0, Math.min(1, (now - rise) / total)));
    }
    update();
    setMounted(true);
    const interval = setInterval(update, 60000);
    return () => clearInterval(interval);
  }, [sunrise, sunset]);

  const width = 160, height = 85, viewY = -15, arcY = 60, arcRadius = 68;
  const startX = 10, endX = width - 10, midX = width / 2;
  const angle = Math.PI * (1 - progress);
  const sunX = midX + arcRadius * Math.cos(angle);
  const sunY = arcY - arcRadius * Math.abs(Math.sin(angle));
  const isDaytime = progress > 0 && progress < 1;

  return (
    <div className="flex flex-col items-center flex-1" suppressHydrationWarning>
      <svg viewBox={`0 ${viewY} ${width} ${height}`} className="w-full max-w-[160px] h-auto">
        <defs>
          <filter id="sunGlow" x="-100%" y="-100%" width="400%" height="400%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <linearGradient id="arcGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#e8a33d" stopOpacity="0.15" />
            <stop offset="50%" stopColor="#e8a33d" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#e8a33d" stopOpacity="0.15" />
          </linearGradient>
          <radialGradient id="sunFill">
            <stop offset="0%" stopColor="#ffe066" />
            <stop offset="100%" stopColor="#e8a33d" />
          </radialGradient>
        </defs>

        <line x1={startX} y1={arcY} x2={endX} y2={arcY} stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
        <path d={`M ${startX} ${arcY} A ${arcRadius} ${arcRadius} 0 0 1 ${endX} ${arcY}`} fill="none" stroke="url(#arcGrad)" strokeWidth="1" strokeDasharray="3 3" />

        {mounted && isDaytime && (
          <path d={`M ${startX} ${arcY} A ${arcRadius} ${arcRadius} 0 0 1 ${sunX} ${sunY}`} fill="none" stroke="#e8a33d" strokeWidth="1.5" strokeOpacity="0.6" />
        )}
        {mounted && isDaytime && (
          <g filter="url(#sunGlow)">
            <circle cx={sunX} cy={sunY} r="5" fill="url(#sunFill)" className="animate-pulse" />
          </g>
        )}
        {mounted && !isDaytime && (
          <circle cx={midX} cy={arcY + 8} r="3" fill="#3f4c5e" opacity="0.5" />
        )}
      </svg>

      <div className="flex justify-between w-full max-w-[160px] px-1">
        <span className="text-[0.55rem] text-[#6a7d92] tabular-nums">
          <span className="text-[#e8a33d] font-bold">↑</span> {formatTime(sunrise)}
        </span>
        <span className="text-[0.55rem] text-[#6a7d92] tabular-nums">
          <span className="text-[#e8a33d] font-bold">↓</span> {formatTime(sunset)}
        </span>
      </div>
    </div>
  );
}
