import { Suspense } from "react";
import Header from "./components/header/Header";
import MusicPlayer from "./components/music/MusicPlayer";
import StocksPanel from "./components/stocks/StocksPanel";
import LaunchesPanel from "./components/launches/LaunchesPanel";
import OddsPanel from "./components/nfl/OddsPanel";
import styles from "./morning.module.css";

function PanelSkeleton() {
  return (
    <div
      style={{
        background: "var(--morning-surface)",
        border: "1px solid var(--morning-border)",
        borderRadius: 12,
        padding: "1.25rem",
        minHeight: 150,
      }}
    />
  );
}

export default function MorningPage() {
  return (
    <div className={styles.dashboard}>
      <Suspense>
        <Header />
      </Suspense>

      <MusicPlayer />

      <div className={styles.fullWidth}>
        <Suspense fallback={<PanelSkeleton />}>
          <StocksPanel />
        </Suspense>
      </div>

      <div className={styles.grid}>
        <Suspense fallback={<PanelSkeleton />}>
          <LaunchesPanel />
        </Suspense>

        <Suspense fallback={<PanelSkeleton />}>
          <OddsPanel />
        </Suspense>
      </div>
    </div>
  );
}
