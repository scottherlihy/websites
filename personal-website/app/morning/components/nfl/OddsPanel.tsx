import { oddsUrl } from "../../../lib/constants";
import type { OddsEvent, TeamOdds } from "../../../lib/types";
import Panel from "../shared/Panel";
import OddsChart from "./OddsChart";
import styles from "./nfl.module.css";

function americanToImplied(odds: number): number {
  if (odds < 0) return -odds / (-odds + 100);
  return 100 / (odds + 100);
}

function avg(...nums: number[]): number {
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

function team(name: string, ...bookmakerOdds: number[]): TeamOdds {
  const odds = avg(...bookmakerOdds);
  return { team: name, odds, impliedProb: americanToImplied(odds) };
}

// Source: VegasInsider.com — 2026-04-13
// Average across bet365, BetMGM, DraftKings, Caesars, FanDuel
const MOCK_TEAMS: TeamOdds[] = [
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

function processOdds(events: OddsEvent[]): TeamOdds[] {
  if (!events.length || !events[0].bookmakers.length) return MOCK_TEAMS;

  const teamOddsMap = new Map<string, number[]>();

  for (const bookmaker of events[0].bookmakers) {
    for (const market of bookmaker.markets) {
      if (market.key !== "outrights") continue;
      for (const outcome of market.outcomes) {
        const existing = teamOddsMap.get(outcome.name) ?? [];
        existing.push(outcome.price);
        teamOddsMap.set(outcome.name, existing);
      }
    }
  }

  const teams: TeamOdds[] = [];
  for (const [t, oddsArr] of teamOddsMap) {
    const avgOdds = oddsArr.reduce((a, b) => a + b, 0) / oddsArr.length;
    teams.push({
      team: t,
      odds: avgOdds,
      impliedProb: americanToImplied(avgOdds),
    });
  }

  teams.sort((a, b) => b.impliedProb - a.impliedProb);
  return teams;
}

async function fetchOdds(): Promise<TeamOdds[]> {
  if (!process.env.ODDS_API_KEY) return MOCK_TEAMS;

  try {
    const res = await fetch(oddsUrl(), { next: { revalidate: 3600 } });
    if (!res.ok) throw new Error("Odds fetch failed");
    const data: OddsEvent[] = await res.json();
    return processOdds(data);
  } catch {
    return MOCK_TEAMS;
  }
}

export default async function OddsPanel() {
  const teams = await fetchOdds();

  return (
    <Panel title="Super Bowl LXI Odds">
      {teams.length > 0 ? (
        <OddsChart teams={teams} />
      ) : (
        <p className={styles.noData}>No odds available at this time</p>
      )}
    </Panel>
  );
}
