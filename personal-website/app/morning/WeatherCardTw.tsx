"use client";

import { useState } from "react";
import type { WeatherData, HourlyWeather, DailyWeather } from "../lib/types";
import WeatherIcon, { weatherCodeToDescription } from "./WeatherIcon";
import SunArc from "./SunArc";

interface WeatherCardProps {
  weather: WeatherData;
  currentHour: number;
}

export default function WeatherCardTw({ weather, currentHour }: WeatherCardProps) {
  const [expanded, setExpanded] = useState(false);
  const description = weatherCodeToDescription(weather.weatherCode);
  const upcomingHourly = weather.hourly.slice(currentHour, currentHour + 8);

  return (
    <div
      className={`flex flex-col gap-2 rounded-xl px-4 py-3 cursor-pointer transition-all max-sm:min-w-0 max-sm:w-full ${
        expanded ? "bg-[#1a2333] flex-1" : "bg-[#121826] hover:bg-[#131a26] min-w-[380px]"
      }`}
      onClick={() => setExpanded(!expanded)}
    >
      {/* Always visible: current conditions + sun arc */}
      <div className="flex items-start gap-4">
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-2">
            <WeatherIcon code={weather.weatherCode} size={32} />
            <span className="text-4xl font-bold text-[#d0d7e2] leading-none">
              {Math.round(weather.temperature)}°
            </span>
          </div>
          <span className="text-[0.65rem] text-[#6a7d92]">
            {description} &middot; {Math.round(weather.windSpeed)} km/h
          </span>
          <span className="text-[0.6rem] text-[#3f4c5e]">Amsterdam</span>
        </div>
        <SunArc sunrise={weather.sunrise} sunset={weather.sunset} />
      </div>

      {/* Hourly forecast (always shown) */}
      <HourlyRow hourly={upcomingHourly} currentHour={currentHour} />

      {/* Expanded: UV chart + weekly forecast side by side */}
      {expanded && (
        <div className="flex gap-4 pt-1">
          <div className="flex-1">
            <UvChart hourly={weather.hourly} currentHour={currentHour} />
          </div>
          <div className="flex-1">
            <WeeklyForecast daily={weather.daily} />
          </div>
        </div>
      )}
    </div>
  );
}

function HourlyRow({ hourly, currentHour }: { hourly: HourlyWeather[]; currentHour: number }) {
  return (
    <div className="flex gap-0.5 pt-2 overflow-x-auto">
      {hourly.map((h) => {
        const hour = new Date(h.time).getHours();
        return (
          <div key={h.time} className="flex flex-col items-center gap-0.5 flex-1 min-w-[36px]">
            <span className="text-[0.5rem] text-[#3f4c5e] tabular-nums">
              {hour === currentHour ? "Now" : `${hour}:00`}
            </span>
            <WeatherIcon code={h.weatherCode} size={18} />
            <span className="text-[0.6rem] font-semibold text-[#d0d7e2] tabular-nums">
              {Math.round(h.temperature)}°
            </span>
          </div>
        );
      })}
    </div>
  );
}

function UvChart({ hourly, currentHour }: { hourly: HourlyWeather[]; currentHour: number }) {
  const [hover, setHover] = useState<{ x: number; y: number; uv: number; hour: number } | null>(null);

  const dayHours = hourly.filter((_, i) => i >= 6 && i <= 21);
  const maxUv = Math.max(...dayHours.map((h) => h.uvIndex), 1);

  const width = 320;
  const height = 50;
  const padding = 4;

  const points = dayHours.map((h, i) => {
    const x = padding + (i / (dayHours.length - 1)) * (width - padding * 2);
    const y = height - padding - (h.uvIndex / maxUv) * (height - padding * 2);
    return { x, y, uv: h.uvIndex, hour: 6 + i };
  });

  const polyline = points.map((p) => `${p.x},${p.y}`).join(" ");

  function uvColor(uv: number) {
    if (uv <= 2) return "#34d399";
    if (uv <= 5) return "#e8a33d";
    if (uv <= 7) return "#f97316";
    return "#f87171";
  }

  const currentUv = hourly[currentHour]?.uvIndex ?? 0;

  function handleMouseMove(e: React.MouseEvent<SVGSVGElement>) {
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const mouseX = ((e.clientX - rect.left) / rect.width) * width;
    let closest = points[0];
    let closestDist = Infinity;
    for (const p of points) {
      const dist = Math.abs(p.x - mouseX);
      if (dist < closestDist) { closestDist = dist; closest = p; }
    }
    if (closest) setHover(closest);
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-baseline justify-between">
        <span className="text-[0.5rem] text-[#3f4c5e] uppercase tracking-wider">UV Index Today</span>
        <span className="text-[0.6rem] font-semibold" style={{ color: uvColor(hover?.uv ?? currentUv) }}>
          {hover ? `${hover.hour}:00 — ${hover.uv.toFixed(1)}` : `Now: ${currentUv.toFixed(1)}`}
        </span>
      </div>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-[50px]"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHover(null)}
      >
        <polygon
          points={`${points[0]?.x ?? padding},${height - padding} ${polyline} ${points[points.length - 1]?.x ?? width - padding},${height - padding}`}
          fill={uvColor(maxUv)}
          opacity="0.1"
        />
        <polyline
          points={polyline}
          fill="none"
          stroke={uvColor(maxUv)}
          strokeWidth="1.5"
          strokeLinejoin="round"
          strokeLinecap="round"
          opacity="0.6"
        />
        {/* Current hour marker */}
        {!hover && currentHour >= 6 && currentHour <= 21 && (() => {
          const p = points[currentHour - 6];
          return p ? <circle cx={p.x} cy={p.y} r="3" fill={uvColor(p.uv)} /> : null;
        })()}
        {/* Hover marker */}
        {hover && (
          <>
            <line x1={hover.x} y1={0} x2={hover.x} y2={height - padding} stroke="#3f4c5e" strokeWidth="0.5" strokeDasharray="2 2" />
            <circle cx={hover.x} cy={hover.y} r="3" fill={uvColor(hover.uv)} />
          </>
        )}
        {[6, 9, 12, 15, 18, 21].map((h) => {
          const p = points[h - 6];
          return p ? (
            <text key={h} x={p.x} y={height - 0.5} textAnchor="middle" fill="#3f4c5e" fontSize="4" fontFamily="inherit">
              {h}
            </text>
          ) : null;
        })}
      </svg>
    </div>
  );
}

function WeeklyForecast({ daily }: { daily: DailyWeather[] }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[0.5rem] text-[#3f4c5e] uppercase tracking-wider">7-Day Forecast</span>
      <div className="flex gap-0.5 overflow-x-auto">
        {daily.map((d) => {
          const date = new Date(d.date);
          const dayName = date.toLocaleDateString("en-US", { weekday: "short", timeZone: "Europe/Amsterdam" });
          const isToday = new Date().toDateString() === date.toDateString();
          return (
            <div key={d.date} className="flex flex-col items-center gap-1 flex-1 min-w-[44px]">
              <span className={`text-[0.5rem] ${isToday ? "text-[#d0d7e2] font-semibold" : "text-[#3f4c5e]"}`}>
                {isToday ? "Today" : dayName}
              </span>
              <WeatherIcon code={d.weatherCode} size={20} />
              <div className="flex gap-1 text-[0.55rem] tabular-nums">
                <span className="font-semibold text-[#d0d7e2]">{Math.round(d.high)}°</span>
                <span className="text-[#3f4c5e]">{Math.round(d.low)}°</span>
              </div>
              <span className="text-[0.45rem] text-[#3f4c5e]">UV {Math.round(d.uvIndexMax)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
