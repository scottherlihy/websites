"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { NFL_DRAFT_DATE, NFL_SEASON_DATE, NFL_SHIELD_URL } from "../lib/constants";

const TARGETS = [
  { label: "Draft", date: NFL_DRAFT_DATE },
  { label: "Season", date: NFL_SEASON_DATE },
];

function getTimeLeft(target: Date) {
  const diff = target.getTime() - Date.now();
  if (diff <= 0) return null;
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor(diff / 3600000) % 24,
    minutes: Math.floor(diff / 60000) % 60,
    seconds: Math.floor(diff / 1000) % 60,
  };
}

function pad(n: number) { return n.toString().padStart(2, "0"); }

export default function NflCountdownsTw() {
  const [times, setTimes] = useState<(ReturnType<typeof getTimeLeft>)[]>([]);

  useEffect(() => {
    const update = () => setTimes(TARGETS.map((t) => getTimeLeft(t.date)));
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-stretch gap-2" suppressHydrationWarning>
      {TARGETS.map((target, i) => {
        const time = times[i];
        return (
          <div key={target.label} className="flex flex-col gap-1.5 px-2.5 py-2 bg-[#121826] rounded-lg">
            <div className="flex items-center gap-1.5">
              <Image src={NFL_SHIELD_URL} alt="NFL" width={14} height={14} className="opacity-60" />
              <span className="text-[0.6rem] font-semibold text-[#6a7d92]">{target.label}</span>
            </div>
            {time ? (
              <div className="flex items-start gap-0.5">
                {[
                  { v: pad(time.days), l: "d" },
                  { v: pad(time.hours), l: "h" },
                  { v: pad(time.minutes), l: "m" },
                  { v: pad(time.seconds), l: "s" },
                ].map(({ v, l }, j) => (
                  <div key={l} className="flex items-start gap-px">
                    {j > 0 && <span className="text-[0.65rem] font-bold text-[#3f4c5e] pt-px">:</span>}
                    <div className="flex flex-col items-center gap-px">
                      <div className="flex gap-px">
                        {v.split("").map((ch, k) => (
                          <span key={k} className="w-3.5 h-[18px] flex items-center justify-center bg-[#1a2333] rounded text-[0.7rem] font-bold text-[#d0d7e2] tabular-nums">
                            {ch}
                          </span>
                        ))}
                      </div>
                      <span className="text-[0.4rem] text-[#3f4c5e] uppercase tracking-wide">{l}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <span className="text-sm font-bold text-emerald-400">LIVE</span>
            )}
          </div>
        );
      })}
    </div>
  );
}
