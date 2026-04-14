"use client";

import { useState, useEffect } from "react";

function formatCountdown(ms: number): string {
  if (ms <= 0) return "T-0 LIFTOFF";
  const seconds = Math.floor(ms / 1000) % 60;
  const minutes = Math.floor(ms / 60000) % 60;
  const hours = Math.floor(ms / 3600000) % 24;
  const days = Math.floor(ms / 86400000);
  return days > 0 ? `T-${days}d ${hours}h ${minutes}m ${seconds}s` : `T-${hours}h ${minutes}m ${seconds}s`;
}

export default function LaunchCountdown({ targetDate }: { targetDate: string }) {
  const [countdown, setCountdown] = useState("");

  useEffect(() => {
    const update = () => setCountdown(formatCountdown(new Date(targetDate).getTime() - Date.now()));
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  return (
    <span className="text-[0.95rem] font-bold text-[#d0d7e2] tracking-wide" suppressHydrationWarning>
      {countdown}
    </span>
  );
}
