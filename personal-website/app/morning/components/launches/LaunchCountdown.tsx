"use client";

import { useState, useEffect } from "react";
import styles from "./launches.module.css";

interface LaunchCountdownProps {
  targetDate: string; // ISO datetime
}

function formatCountdown(ms: number): string {
  if (ms <= 0) return "T-0 LIFTOFF";
  const seconds = Math.floor(ms / 1000) % 60;
  const minutes = Math.floor(ms / 60000) % 60;
  const hours = Math.floor(ms / 3600000) % 24;
  const days = Math.floor(ms / 86400000);

  if (days > 0) {
    return `T-${days}d ${hours}h ${minutes}m ${seconds}s`;
  }
  return `T-${hours}h ${minutes}m ${seconds}s`;
}

export default function LaunchCountdown({ targetDate }: LaunchCountdownProps) {
  const [countdown, setCountdown] = useState<string>("");

  useEffect(() => {
    function update() {
      const diff = new Date(targetDate).getTime() - Date.now();
      setCountdown(formatCountdown(diff));
    }
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  return (
    <span className={styles.countdown} suppressHydrationWarning>
      {countdown}
    </span>
  );
}
