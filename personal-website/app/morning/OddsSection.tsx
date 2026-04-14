import Image from "next/image";
import { NFL_TEAM_LOGOS } from "../lib/constants";
import type { TeamOdds } from "../lib/types";

// Same hardcoded odds from the original
function avg(...nums: number[]) { return nums.reduce((a, b) => a + b, 0) / nums.length; }
function americanToImplied(odds: number) { return odds < 0 ? -odds / (-odds + 100) : 100 / (odds + 100); }
function team(name: string, ...odds: number[]): TeamOdds {
  const o = avg(...odds);
  return { team: name, odds: o, impliedProb: americanToImplied(o) };
}

const TEAMS: TeamOdds[] = [
  team("Los Angeles Rams", 750, 800, 750, 775, 700),
  team("Seattle Seahawks", 900, 850, 950, 900, 950),
  team("Buffalo Bills", 1000, 1000, 1000, 1000, 1000),
  team("Baltimore Ravens", 1000, 1000, 1000, 1050, 1100),
  team("Kansas City Chiefs", 1500, 1600, 1400, 1500, 1600),
  team("Green Bay Packers", 1600, 1500, 1500, 1500, 1800),
  team("San Francisco 49ers", 1600, 1800, 1500, 1600, 1600),
  team("Los Angeles Chargers", 1600, 1600, 1600, 1600, 1500),
  team("Philadelphia Eagles", 1600, 1500, 1700, 1500, 1700),
  team("Detroit Lions", 1600, 1500, 1700, 1500, 1800),
  team("Houston Texans", 2000, 2000, 1800, 2000, 2000),
  team("Denver Broncos", 1800, 1700, 1800, 2000, 1900),
  team("New England Patriots", 1800, 1800, 1900, 1900, 1800),
  team("Jacksonville Jaguars", 2200, 2000, 2500, 2200, 2200),
  team("Chicago Bears", 2500, 2500, 2500, 2200, 2500),
  team("Cincinnati Bengals", 3000, 3000, 3000, 3000, 3000),
  team("Dallas Cowboys", 2800, 3500, 3000, 3000, 2200),
  team("Tampa Bay Buccaneers", 4000, 4000, 4500, 5000, 4500),
  team("Minnesota Vikings", 5000, 5000, 4500, 5000, 5000),
  team("Indianapolis Colts", 5000, 5000, 6000, 5500, 3500),
  team("Washington Commanders", 5000, 6600, 6500, 6000, 4500),
  team("Pittsburgh Steelers", 7500, 8000, 4500, 7000, 8000),
  team("New York Giants", 6000, 8000, 7000, 6000, 7000),
  team("Atlanta Falcons", 9000, 8000, 11000, 6000, 7500),
  team("New Orleans Saints", 8000, 10000, 9000, 12500, 10000),
  team("Carolina Panthers", 10000, 10000, 9000, 12500, 8000),
  team("Tennessee Titans", 15000, 15000, 11000, 12500, 15000),
  team("Las Vegas Raiders", 15000, 15000, 15000, 12500, 12500),
  team("Cleveland Browns", 20000, 25000, 15000, 15000, 25000),
  team("New York Jets", 25000, 25000, 20000, 20000, 25000),
  team("Miami Dolphins", 30000, 25000, 30000, 25000, 25000),
  team("Arizona Cardinals", 30000, 25000, 40000, 25000, 25000),
].sort((a, b) => b.impliedProb - a.impliedProb);

function fmtOdds(odds: number) { return odds > 0 ? `+${Math.round(odds)}` : `${Math.round(odds)}`; }

export default function OddsSection() {
  const maxProb = TEAMS[0].impliedProb;

  return (
    <section className="bg-[#121826] rounded-xl p-5">
      <h2 className="text-[0.65rem] font-medium uppercase tracking-[0.12em] text-[#3f4c5e] mb-4">Super Bowl LXI Odds</h2>
      <div className="flex flex-col gap-1">
        {TEAMS.map((t, i) => {
          const logo = NFL_TEAM_LOGOS[t.team];
          return (
            <div key={t.team} className="flex items-center gap-2 text-xs">
              <span className="w-5 text-right text-[0.6rem] text-[#3f4c5e]">{i + 1}</span>
              {logo ? (
                <Image src={logo} alt={t.team} width={20} height={20} className="w-5 h-5 shrink-0 object-contain" />
              ) : (
                <span className="w-5 h-5 shrink-0" />
              )}
              <span className="w-36 shrink-0 font-medium text-[#d0d7e2] truncate">{t.team}</span>
              <div className="flex-1 h-1 bg-[#1a2333] rounded-sm overflow-hidden">
                <div
                  className="h-full rounded-sm"
                  style={{
                    width: `${(t.impliedProb / maxProb) * 100}%`,
                    background: `hsl(var(--accent-hue) 100% 50%)`,
                  }}
                />
              </div>
              <span className="w-12 text-right text-[0.65rem] font-semibold text-[#6a7d92]">{fmtOdds(t.odds)}</span>
              <span className="w-10 text-right text-[0.6rem] text-[#3f4c5e]">{(t.impliedProb * 100).toFixed(1)}%</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
