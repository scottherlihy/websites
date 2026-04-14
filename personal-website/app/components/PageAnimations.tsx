"use client";

import { useEffect, useState } from "react";

function DutchBike({ size = 60 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none" stroke="black" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      {/* Rear wheel */}
      <circle cx="20" cy="55" r="14" />
      <circle cx="20" cy="55" r="2" fill="black" />
      {/* Front wheel */}
      <circle cx="60" cy="55" r="14" />
      <circle cx="60" cy="55" r="2" fill="black" />
      {/* Frame - rear triangle */}
      <line x1="20" y1="55" x2="35" y2="30" />
      <line x1="20" y1="55" x2="38" y2="45" />
      {/* Frame - seat tube */}
      <line x1="35" y1="30" x2="38" y2="45" />
      {/* Frame - top tube to head tube */}
      <line x1="35" y1="30" x2="55" y2="28" />
      {/* Frame - down tube */}
      <line x1="38" y1="45" x2="55" y2="35" />
      {/* Head tube / fork */}
      <line x1="55" y1="28" x2="60" y2="55" />
      {/* Handlebars - swept back Dutch style */}
      <line x1="55" y1="28" x2="50" y2="24" />
      <line x1="50" y1="24" x2="47" y2="26" />
      {/* Seat */}
      <line x1="32" y1="28" x2="38" y2="28" />
      {/* Seat post */}
      <line x1="35" y1="28" x2="35" y2="30" />
      {/* Chain guard hint */}
      <path d="M24 48 Q31 42 38 45" strokeWidth="1.5" />
      {/* Rear fender */}
      <path d="M10 42 A14 14 0 0 1 30 42" strokeWidth="1.5" fill="none" />
      {/* Front fender */}
      <path d="M50 42 A14 14 0 0 1 70 42" strokeWidth="1.5" fill="none" />
      {/* Front basket */}
      <rect x="56" y="18" width="10" height="8" rx="1" strokeWidth="1.5" />
    </svg>
  );
}

function Rocket({ size = 50 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 80" fill="none" stroke="black" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      {/* Body */}
      <path d="M30 5 C20 20 18 40 20 55 L40 55 C42 40 40 20 30 5Z" />
      {/* Nose cone */}
      <path d="M25 18 L30 5 L35 18" strokeWidth="1.5" />
      {/* Window */}
      <circle cx="30" cy="28" r="5" strokeWidth="2" />
      <circle cx="30" cy="28" r="2" fill="black" />
      {/* Fins */}
      <path d="M20 48 L10 62 L20 55" />
      <path d="M40 48 L50 62 L40 55" />
      {/* Exhaust nozzle */}
      <path d="M23 55 L22 62 L38 62 L37 55" />
      {/* Exhaust flames */}
      <path d="M25 62 L30 75 L35 62" strokeWidth="1.5" />
      <path d="M27 62 L30 70 L33 62" strokeWidth="1" />
    </svg>
  );
}

interface AnimationPhase {
  type: "bike" | "rocket";
  active: boolean;
}

export default function PageAnimations() {
  const [phase, setPhase] = useState<AnimationPhase | null>(null);

  useEffect(() => {
    function runCycle() {
      // Bike after 2s
      const bikeTimer = setTimeout(() => {
        setPhase({ type: "bike", active: true });

        // Bike animation lasts ~6.6s
        setTimeout(() => {
          setPhase(null);

          // Rocket 5s after bike finishes
          const rocketTimer = setTimeout(() => {
            setPhase({ type: "rocket", active: true });

            // Rocket animation lasts ~5s
            setTimeout(() => {
              setPhase(null);
            }, 5500);
          }, 5000);

          timers.push(rocketTimer);
        }, 8000);
      }, 2000);

      timers.push(bikeTimer);
    }

    const timers: ReturnType<typeof setTimeout>[] = [];

    runCycle();

    // Repeat every ~85s (2s delay + 8s bike + 15s gap + 8s rocket + ~52s wait ≈ 85s, but we use 60s from cycle start for the repeat)
    // 2s delay + 10s bike + 5s gap + 10s rocket + ~60s wait
    const interval = setInterval(runCycle, 87000);

    return () => {
      timers.forEach(clearTimeout);
      clearInterval(interval);
    };
  }, []);

  if (!phase) return null;

  if (phase.type === "bike") {
    return (
      <div
        className="fixed z-50 pointer-events-none"
        style={{
          animation: "bikeRide 7.5s linear forwards",
        }}
      >
        <DutchBike size={45} />
        <style>{`
          @keyframes bikeRide {
            0%   { bottom: 10px; left: -60px; opacity: 0; }
            5%   { opacity: 0.45; }
            90%  { opacity: 0.45; }
            100% { bottom: 10px; left: 100vw; opacity: 0; }
          }
        `}</style>
      </div>
    );
  }

  if (phase.type === "rocket") {
    return (
      <div
        className="fixed z-0 pointer-events-none"
        style={{
          animation: "rocketLaunch 5s linear forwards",
        }}
      >
        <Rocket size={40} />
        <style>{`
          @keyframes rocketLaunch {
            0%   { bottom: -60px; right: 40px; opacity: 0; transform: rotate(0deg); }
            5%   { bottom: 5vh;  right: 42px; opacity: 0.45; transform: rotate(-2deg); }
            20%  { bottom: 20vh; right: 55px; transform: rotate(-6deg); }
            40%  { bottom: 40vh; right: 80px; transform: rotate(-12deg); }
            60%  { bottom: 60vh; right: 115px; opacity: 0.4; transform: rotate(-18deg); }
            80%  { bottom: 80vh; right: 160px; opacity: 0.2; transform: rotate(-24deg); }
            100% { bottom: 105vh; right: 210px; opacity: 0; transform: rotate(-30deg); }
          }
        `}</style>
      </div>
    );
  }

  return null;
}
