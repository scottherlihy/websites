import { Suspense } from "react";
import Header from "./Header";
import StocksSection from "./StocksSection";
import LaunchesSection from "./LaunchesSection";
import OddsSection from "./OddsSection";
import { MusicProvider, MusicControlsBar, MusicWaveStrip } from "./MusicPlayerTw";

export default function MorningPage() {
  return (
    <MusicProvider>
      <div className="max-w-[1400px] mx-auto px-6 py-8 flex flex-col gap-8">
        <MusicControlsBar />

        <Suspense>
          <Header />
        </Suspense>

        <MusicWaveStrip />

        <Suspense fallback={<div className="h-40 rounded-xl bg-[#121826] animate-pulse" />}>
          <StocksSection />
        </Suspense>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Suspense fallback={<div className="h-60 rounded-xl bg-[#121826] animate-pulse" />}>
            <LaunchesSection />
          </Suspense>

          <Suspense fallback={<div className="h-60 rounded-xl bg-[#121826] animate-pulse" />}>
            <OddsSection />
          </Suspense>
        </div>
      </div>
    </MusicProvider>
  );
}
