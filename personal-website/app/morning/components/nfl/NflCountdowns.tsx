"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { NFL_DRAFT_DATE, NFL_SEASON_DATE, NFL_SHIELD_URL } from "../../../lib/constants";
import styles from "./nfl.module.css";

interface CountdownTarget {
  label: string;
  date: Date;
}

const TARGETS: CountdownTarget[] = [
  { label: "NFL Draft", date: NFL_DRAFT_DATE },
  { label: "NFL Season", date: NFL_SEASON_DATE },
];

function getTimeLeft(target: Date): { days: number; hours: number; minutes: number; seconds: number } | null {
  const diff = target.getTime() - Date.now();
  if (diff <= 0) return null;
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor(diff / 3600000) % 24,
    minutes: Math.floor(diff / 60000) % 60,
    seconds: Math.floor(diff / 1000) % 60,
  };
}

export default function NflCountdowns() {
  const [times, setTimes] = useState<(ReturnType<typeof getTimeLeft>)[]>([]);

  useEffect(() => {
    function update() {
      setTimes(TARGETS.map((t) => getTimeLeft(t.date)));
    }
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={styles.countdownsCompact} suppressHydrationWarning>
      <Image
        src={NFL_SHIELD_URL}
        alt="NFL"
        width={18}
        height={18}
        className={styles.nflShield}
      />
      {TARGETS.map((target, i) => {
        const time = times[i];
        return (
          <div key={target.label} className={styles.countdownChip}>
            <span className={styles.countdownChipLabel}>{target.label}</span>
            {time ? (
              <span className={styles.countdownChipTime}>
                {time.days}d {time.hours}h {time.minutes}m {time.seconds}s
              </span>
            ) : (
              <span className={styles.countdownLive}>LIVE</span>
            )}
          </div>
        );
      })}
    </div>
  );
}
