import Image from "next/image";
import { LAUNCHES_URL } from "../lib/constants";
import type { LaunchResponse, Launch } from "../lib/types";
import LaunchCardTw from "./LaunchCardTw";

const LOGO_CLASSES: Record<string, string> = {
  "SpaceX": "opacity-50 brightness-200",
  "Rocket Lab": "opacity-50 brightness-200",
  "Blue Origin": "opacity-40 invert brightness-0 -translate-y-[60%]",
  "CAS Space": "opacity-50 brightness-200",
  "China Aerospace Science and Technology Corporation": "opacity-35 -translate-y-[60%]",
};

async function fetchLaunches(): Promise<Launch[]> {
  try {
    const res = await fetch(LAUNCHES_URL, { next: { revalidate: 900 } });
    if (!res.ok) throw new Error();
    const data: LaunchResponse = await res.json();
    const all = data.results;
    const now = Date.now();
    const t7 = now + 7 * 86400000;
    const t14 = now + 14 * 86400000;
    const within7 = all.filter((l) => new Date(l.net).getTime() <= t7);
    return within7.length >= 10 ? within7 : all.filter((l) => new Date(l.net).getTime() <= t14);
  } catch { return []; }
}

function groupByDate(launches: Launch[]) {
  const groups = new Map<string, Launch[]>();
  const now = new Date();
  const todayStr = now.toLocaleDateString("en-US", { timeZone: "UTC" });
  for (const launch of launches) {
    const d = new Date(launch.net);
    const dateStr = d.toLocaleDateString("en-US", { timeZone: "UTC" });
    const isPast = d.getTime() <= now.getTime();
    const label = isPast ? "Launched" : dateStr === todayStr ? "Today" : d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", timeZone: "UTC" });
    const existing = groups.get(label) ?? [];
    existing.push(launch);
    groups.set(label, existing);
  }
  return groups;
}

export default async function LaunchesSection() {
  const launches = await fetchLaunches();
  if (launches.length === 0) {
    return (
      <section className="bg-[#121826] rounded-xl p-5">
        <h2 className="text-[0.65rem] font-medium uppercase tracking-[0.12em] text-[#3f4c5e] mb-4">Upcoming Launches</h2>
        <p className="text-sm text-[#3f4c5e]">Couldn&apos;t load launch data</p>
      </section>
    );
  }

  const groups = groupByDate(launches);
  const firstUpcoming = launches.find((l) => new Date(l.net).getTime() > Date.now());
  const hasToday = groups.has("Today");

  // Find which date group contains the first upcoming launch
  let nextGroupLabel: string | null = null;
  if (!hasToday && firstUpcoming) {
    for (const [label, dateLaunches] of groups) {
      if (dateLaunches.some((l) => l.id === firstUpcoming.id)) {
        nextGroupLabel = label;
        break;
      }
    }
  }

  return (
    <section className="bg-[#121826] rounded-xl p-5">
      <h2 className="text-[0.65rem] font-medium uppercase tracking-[0.12em] text-[#3f4c5e] mb-4">Upcoming Launches</h2>
      <div className="flex flex-col gap-4">
        {Array.from(groups.entries()).map(([dateLabel, dateLaunches]) => {
          const isAccent = dateLabel === "Today" || dateLabel === nextGroupLabel;
          return (
            <div key={dateLabel} className="flex flex-col gap-1.5">
              <span
                className={`text-[0.55rem] font-medium uppercase tracking-[0.1em] pl-1 ${isAccent ? "font-bold" : "text-[#3f4c5e]"}`}
                style={isAccent ? { color: `hsl(var(--accent-hue) 100% 50%)` } : undefined}
              >
                {dateLabel === nextGroupLabel ? `Next · ${dateLabel}` : dateLabel}
              </span>
              {dateLaunches.map((launch) => (
                <LaunchCardTw
                  key={launch.id}
                  launch={launch}
                  isNext={launch.id === firstUpcoming?.id}

                  logoFilter={LOGO_CLASSES[launch.launch_service_provider.name] ?? ""}
                />
              ))}
            </div>
          );
        })}
      </div>
    </section>
  );
}
