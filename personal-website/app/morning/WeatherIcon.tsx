interface WeatherIconProps {
  code: number;
  size?: number;
}

// Round to avoid server/client hydration mismatch on floating point
function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

// WMO Weather codes → clean SVG icons
export default function WeatherIcon({ code, size = 24 }: WeatherIconProps) {
  const s = size;
  const half = s / 2;
  const color = "varound2(--morning-text-secondary)";
  const highlight = "varound2(--morning-accent-orange)";

  // Clear sky
  if (code === 0) {
    const r = s * 0.22;
    const rayLen = s * 0.12;
    const rayDist = s * 0.36;
    return (
      <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} fill="none">
        <circle cx={half} cy={half} r={r} fill={highlight} />
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => {
          const rad = (angle * Math.PI) / 180;
          const x1 = round2(half + Math.cos(rad) * (rayDist - rayLen));
          const y1 = round2(half + Math.sin(rad) * (rayDist - rayLen));
          const x2 = round2(half + Math.cos(rad) * rayDist);
          const y2 = round2(half + Math.sin(rad) * rayDist);
          return (
            <line key={angle} x1={x1} y1={y1} x2={x2} y2={y2} stroke={highlight} strokeWidth={1.5} strokeLinecap="round" />
          );
        })}
      </svg>
    );
  }

  // Partly cloudy
  if (code <= 3) {
    return (
      <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} fill="none">
        <circle cx={s * 0.35} cy={s * 0.32} r={s * 0.14} fill={highlight} />
        {[0, 60, 120, 180, 240, 300].map((angle) => {
          const rad = (angle * Math.PI) / 180;
          const x1 = round2(s * 0.35 + Math.cos(rad) * (s * 0.2));
          const y1 = round2(s * 0.32 + Math.sin(rad) * (s * 0.2));
          const x2 = round2(s * 0.35 + Math.cos(rad) * (s * 0.26));
          const y2 = round2(s * 0.32 + Math.sin(rad) * (s * 0.26));
          return <line key={angle} x1={x1} y1={y1} x2={x2} y2={y2} stroke={highlight} strokeWidth={1} strokeLinecap="round" />;
        })}
        <path d={`M${s * 0.28} ${s * 0.62} a${s * 0.14} ${s * 0.14} 0 0 1 ${s * 0.13}-${s * 0.12} a${s * 0.1} ${s * 0.1} 0 0 1 ${s * 0.18} 0 a${s * 0.08} ${s * 0.08} 0 0 1 ${s * 0.12} ${s * 0.12} z`} fill={color} opacity={0.7} />
      </svg>
    );
  }

  // Fog
  if (code <= 49) {
    return (
      <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} fill="none">
        <line x1={s * 0.2} y1={s * 0.35} x2={s * 0.8} y2={s * 0.35} stroke={color} strokeWidth={2} strokeLinecap="round" opacity={0.4} />
        <line x1={s * 0.15} y1={s * 0.5} x2={s * 0.85} y2={s * 0.5} stroke={color} strokeWidth={2} strokeLinecap="round" opacity={0.6} />
        <line x1={s * 0.2} y1={s * 0.65} x2={s * 0.8} y2={s * 0.65} stroke={color} strokeWidth={2} strokeLinecap="round" opacity={0.4} />
      </svg>
    );
  }

  // Drizzle / Light rain
  if (code <= 59) {
    return (
      <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} fill="none">
        <path d={`M${s * 0.2} ${s * 0.45} a${s * 0.16} ${s * 0.16} 0 0 1 ${s * 0.15}-${s * 0.14} a${s * 0.12} ${s * 0.12} 0 0 1 ${s * 0.22} 0 a${s * 0.1} ${s * 0.1} 0 0 1 ${s * 0.14} ${s * 0.14} z`} fill={color} opacity={0.6} />
        <line x1={s * 0.35} y1={s * 0.6} x2={s * 0.32} y2={s * 0.72} stroke="#6ba3d6" strokeWidth={1.5} strokeLinecap="round" />
        <line x1={s * 0.55} y1={s * 0.6} x2={s * 0.52} y2={s * 0.72} stroke="#6ba3d6" strokeWidth={1.5} strokeLinecap="round" />
      </svg>
    );
  }

  // Rain
  if (code <= 69) {
    return (
      <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} fill="none">
        <path d={`M${s * 0.18} ${s * 0.4} a${s * 0.16} ${s * 0.16} 0 0 1 ${s * 0.15}-${s * 0.14} a${s * 0.12} ${s * 0.12} 0 0 1 ${s * 0.22} 0 a${s * 0.1} ${s * 0.1} 0 0 1 ${s * 0.14} ${s * 0.14} z`} fill={color} opacity={0.7} />
        <line x1={s * 0.3} y1={s * 0.55} x2={s * 0.25} y2={s * 0.72} stroke="#5b93c6" strokeWidth={1.5} strokeLinecap="round" />
        <line x1={s * 0.45} y1={s * 0.55} x2={s * 0.40} y2={s * 0.72} stroke="#5b93c6" strokeWidth={1.5} strokeLinecap="round" />
        <line x1={s * 0.60} y1={s * 0.55} x2={s * 0.55} y2={s * 0.72} stroke="#5b93c6" strokeWidth={1.5} strokeLinecap="round" />
      </svg>
    );
  }

  // Snow
  if (code <= 79) {
    return (
      <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} fill="none">
        <path d={`M${s * 0.18} ${s * 0.4} a${s * 0.16} ${s * 0.16} 0 0 1 ${s * 0.15}-${s * 0.14} a${s * 0.12} ${s * 0.12} 0 0 1 ${s * 0.22} 0 a${s * 0.1} ${s * 0.1} 0 0 1 ${s * 0.14} ${s * 0.14} z`} fill={color} opacity={0.6} />
        <circle cx={s * 0.3} cy={s * 0.65} r={2} fill="#b4d4e8" />
        <circle cx={s * 0.5} cy={s * 0.6} r={2} fill="#b4d4e8" />
        <circle cx={s * 0.65} cy={s * 0.68} r={2} fill="#b4d4e8" />
      </svg>
    );
  }

  // Rain showers
  if (code <= 86) {
    return (
      <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} fill="none">
        <path d={`M${s * 0.18} ${s * 0.4} a${s * 0.16} ${s * 0.16} 0 0 1 ${s * 0.15}-${s * 0.14} a${s * 0.12} ${s * 0.12} 0 0 1 ${s * 0.22} 0 a${s * 0.1} ${s * 0.1} 0 0 1 ${s * 0.14} ${s * 0.14} z`} fill={color} opacity={0.7} />
        <line x1={s * 0.28} y1={s * 0.55} x2={s * 0.22} y2={s * 0.75} stroke="#5b93c6" strokeWidth={2} strokeLinecap="round" />
        <line x1={s * 0.45} y1={s * 0.52} x2={s * 0.39} y2={s * 0.75} stroke="#5b93c6" strokeWidth={2} strokeLinecap="round" />
        <line x1={s * 0.62} y1={s * 0.55} x2={s * 0.56} y2={s * 0.75} stroke="#5b93c6" strokeWidth={2} strokeLinecap="round" />
      </svg>
    );
  }

  // Thunderstorm
  if (code <= 99) {
    return (
      <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} fill="none">
        <path d={`M${s * 0.18} ${s * 0.38} a${s * 0.16} ${s * 0.16} 0 0 1 ${s * 0.15}-${s * 0.14} a${s * 0.12} ${s * 0.12} 0 0 1 ${s * 0.22} 0 a${s * 0.1} ${s * 0.1} 0 0 1 ${s * 0.14} ${s * 0.14} z`} fill={color} opacity={0.8} />
        <polyline points={`${s * 0.45},${s * 0.48} ${s * 0.38},${s * 0.62} ${s * 0.5},${s * 0.62} ${s * 0.42},${s * 0.8}`} stroke={highlight} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </svg>
    );
  }

  // Fallback — overcast cloud
  return (
    <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} fill="none">
      <path d={`M${s * 0.18} ${s * 0.55} a${s * 0.18} ${s * 0.18} 0 0 1 ${s * 0.17}-${s * 0.16} a${s * 0.14} ${s * 0.14} 0 0 1 ${s * 0.24} 0 a${s * 0.11} ${s * 0.11} 0 0 1 ${s * 0.16} ${s * 0.16} z`} fill={color} opacity={0.5} />
    </svg>
  );
}

export function weatherCodeToDescription(code: number): string {
  if (code === 0) return "Clear sky";
  if (code <= 3) return "Partly cloudy";
  if (code <= 49) return "Foggy";
  if (code <= 59) return "Drizzle";
  if (code <= 69) return "Rain";
  if (code <= 79) return "Snow";
  if (code <= 86) return "Showers";
  if (code <= 99) return "Thunderstorm";
  return "Overcast";
}
