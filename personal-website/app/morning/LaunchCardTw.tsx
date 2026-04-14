"use client";

import { useState } from "react";
import Image from "next/image";
import type { Launch } from "../lib/types";
import LaunchCountdown from "./LaunchCountdown";

interface Props {
  launch: Launch;
  isNext: boolean;
  logoFilter: string;
}

function fmtTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", timeZoneName: "short" });
}

export default function LaunchCardTw({ launch, isNext, logoFilter }: Props) {
  const [expanded, setExpanded] = useState(false);
  const logo = launch.launch_service_provider?.logo_url;
  const rocket = launch.rocket?.configuration;
  const mission = launch.mission;
  const isPast = new Date(launch.net).getTime() <= Date.now();

  return (
    <div
      className={`relative rounded-lg px-3 py-2.5 overflow-hidden cursor-pointer ${
        isNext || expanded ? "bg-[#222d40]" : "bg-[#1a2333]"
      }`}
      onClick={() => setExpanded(!expanded)}
    >
      {logo && !expanded && (
        <Image
          src={logo}
          alt=""
          width={192}
          height={192}
          className={`absolute right-2 top-1/2 -translate-y-1/2 w-48 h-48 object-contain pointer-events-none ${logoFilter}`}
          style={{
            maskImage: "linear-gradient(to right, transparent, rgba(0,0,0,0.3) 10%, black 30%)",
            WebkitMaskImage: "linear-gradient(to right, transparent, rgba(0,0,0,0.3) 10%, black 30%)",
          }}
        />
      )}

      <div className="relative flex flex-col gap-0.5">
        {launch.webcast_live && (
          <span className="inline-flex items-center gap-1.5 text-[0.5rem] font-bold tracking-wider text-red-400 w-fit animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
            LIVE
          </span>
        )}
        {isNext && !isPast && (
          <LaunchCountdown targetDate={launch.net} />
        )}
        {isPast && isNext && <span className="text-sm font-bold text-[#d0d7e2]">T-0</span>}
        <span className="text-[0.8rem] font-semibold text-[#d0d7e2] truncate">{launch.name}</span>
        <span className="text-[0.65rem] text-[#6a7d92]">{fmtTime(launch.net)}</span>
        <span className="text-[0.65rem] text-[#3f4c5e]">
          {launch.launch_service_provider.name} &middot; {launch.pad.location.name}
        </span>
      </div>

      {expanded && (
        <div className="relative flex flex-col gap-3 mt-3">
          {(launch.image || rocket?.image_url) && (
            <div className="w-full h-[180px] rounded-md overflow-hidden bg-[#0e131c]">
              <Image
                src={launch.image || rocket?.image_url || ""}
                alt=""
                width={600}
                height={200}
                className="w-full h-full object-contain"
              />
            </div>
          )}
          <div className="flex gap-6">
            <div className="flex-1 flex flex-col gap-1 min-w-0">
              <span className="text-sm font-bold text-[#d0d7e2]">{rocket?.full_name || rocket?.name}</span>
              {mission?.description && (
                <p className="text-[0.7rem] leading-relaxed text-[#6a7d92] m-0">{mission.description}</p>
              )}
              {launch.vidURLs.length > 0 && (
                <a
                  href={launch.vidURLs[0].url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[0.65rem] font-medium mt-1 no-underline hover:underline"
                  style={{ color: `hsl(var(--accent-hue) 100% 50%)` }}
                  onClick={(e) => e.stopPropagation()}
                >
                  Watch webcast &rarr;
                </a>
              )}
            </div>
            <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 shrink-0">
              {([
                mission?.type ? ["Mission", mission.type] : null,
                mission?.orbit ? ["Orbit", mission.orbit.abbrev] : null,
                rocket?.length ? ["Height", `${rocket.length}m`] : null,
                rocket?.launch_mass ? ["Mass", `${rocket.launch_mass}t`] : null,
                rocket?.leo_capacity ? ["LEO", `${rocket.leo_capacity}kg`] : null,
                rocket?.to_thrust ? ["Thrust", `${rocket.to_thrust}kN`] : null,
                rocket ? ["Record", `${rocket.successful_launches}/${rocket.total_launch_count}`] : null,
              ] as (string[] | null)[]).filter((x): x is string[] => x !== null).map(([label, value]) => (
                <div key={label} className="flex flex-col gap-px">
                  <span className="text-[0.45rem] text-[#3f4c5e] uppercase tracking-wide">{label}</span>
                  <span className="text-[0.65rem] font-semibold text-[#d0d7e2]">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
