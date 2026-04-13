import { LAUNCHES_URL } from "../../../lib/constants";
import type { LaunchResponse, Launch } from "../../../lib/types";
import Panel from "../shared/Panel";
import LaunchCountdown from "./LaunchCountdown";
import styles from "./launches.module.css";

const MOCK_LAUNCHES: Launch[] = [
  {
    id: "1",
    name: "Falcon 9 | Starlink Group 12-5",
    net: new Date(Date.now() + 2 * 86400000 + 5 * 3600000).toISOString(),
    status: { id: 1, name: "Go" },
    lsp_name: "SpaceX",
    mission: "Starlink Group 12-5",
    pad: "SLC-40",
    location: "Cape Canaveral, FL, USA",
    image: null,
  },
  {
    id: "2",
    name: "Electron | Kineis Constellation",
    net: new Date(Date.now() + 5 * 86400000).toISOString(),
    status: { id: 1, name: "Go" },
    lsp_name: "Rocket Lab",
    mission: "Kineis Constellation",
    pad: "Pad A",
    location: "Mahia Peninsula, New Zealand",
    image: null,
  },
  {
    id: "3",
    name: "Neutron | Demo Flight",
    net: new Date(Date.now() + 14 * 86400000).toISOString(),
    status: { id: 1, name: "TBD" },
    lsp_name: "Rocket Lab",
    mission: "Demo Flight",
    pad: "Launch Pad 3",
    location: "Wallops Island, VA, USA",
    image: null,
  },
  {
    id: "4",
    name: "Vulcan Centaur | NSSL Phase 3",
    net: new Date(Date.now() + 20 * 86400000).toISOString(),
    status: { id: 1, name: "Go" },
    lsp_name: "United Launch Alliance",
    mission: "NSSL Phase 3",
    pad: "SLC-41",
    location: "Cape Canaveral, FL, USA",
    image: null,
  },
];

async function fetchLaunches(): Promise<Launch[]> {
  try {
    const res = await fetch(LAUNCHES_URL, { next: { revalidate: 900 } });
    if (!res.ok) throw new Error("Launch fetch failed");
    const data: LaunchResponse = await res.json();
    return data.results;
  } catch {
    return MOCK_LAUNCHES;
  }
}

function formatLaunchDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
  });
}

export default async function LaunchesPanel() {
  const launches = await fetchLaunches();

  return (
    <Panel title="Upcoming Launches">
      <div className={styles.launchList}>
        {launches.map((launch, i) => (
          <div
            key={launch.id}
            className={`${styles.launchItem} ${i === 0 ? styles.nextLaunch : ""}`}
          >
            <div className={styles.launchInfo}>
              {i === 0 && (
                <>
                  <span className={styles.nextLabel}>Next Launch</span>
                  <LaunchCountdown targetDate={launch.net} />
                </>
              )}
              <span className={styles.launchName}>{launch.name}</span>
              <span className={styles.launchMeta}>
                {formatLaunchDate(launch.net)}
              </span>
              <span className={styles.launchProvider}>
                {launch.lsp_name} &middot; {launch.location}
              </span>
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}
