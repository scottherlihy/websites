import Image from "next/image";
import { LAUNCHES_URL } from "../../../lib/constants";
import type { LaunchResponse, Launch } from "../../../lib/types";
import Panel from "../shared/Panel";
import LaunchCountdown from "./LaunchCountdown";
import styles from "./launches.module.css";

async function fetchLaunches(): Promise<Launch[]> {
  try {
    const res = await fetch(LAUNCHES_URL, { next: { revalidate: 900 } });
    if (!res.ok) throw new Error("Launch fetch failed");
    const data: LaunchResponse = await res.json();
    return data.results;
  } catch {
    return [];
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

  if (launches.length === 0) {
    return (
      <Panel title="Upcoming Launches">
        <p style={{ color: "var(--morning-text-muted)", fontSize: "0.8rem" }}>
          Couldn&apos;t load launch data
        </p>
      </Panel>
    );
  }

  return (
    <Panel title="Upcoming Launches">
      <div className={styles.launchList}>
        {launches.map((launch, i) => {
          const logoUrl = launch.launch_service_provider?.logo_url;
          return (
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
                  {launch.launch_service_provider.name} &middot;{" "}
                  {launch.pad.location.name}
                </span>
              </div>
              {logoUrl && (
                <Image
                  src={logoUrl}
                  alt={launch.launch_service_provider.name}
                  width={52}
                  height={52}
                  className={styles.lspLogo}
                />
              )}
            </div>
          );
        })}
      </div>
    </Panel>
  );
}
