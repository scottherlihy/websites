import { oddsUrl } from "../../../lib/constants";
import type { OddsEvent, TeamOdds } from "../../../lib/types";
import Panel from "../shared/Panel";
import OddsChart from "./OddsChart";
import styles from "./nfl.module.css";

const MOCK_TEAMS: TeamOdds[] = [
  { team: "Kansas City Chiefs", odds: -150, impliedProb: 0.6 },
  { team: "Detroit Lions", odds: +600, impliedProb: 0.143 },
  { team: "Philadelphia Eagles", odds: +700, impliedProb: 0.125 },
  { team: "Buffalo Bills", odds: +800, impliedProb: 0.111 },
  { team: "Baltimore Ravens", odds: +1000, impliedProb: 0.091 },
  { team: "San Francisco 49ers", odds: +1200, impliedProb: 0.077 },
  { team: "Green Bay Packers", odds: +1400, impliedProb: 0.067 },
  { team: "Houston Texans", odds: +1800, impliedProb: 0.053 },
  { team: "Cincinnati Bengals", odds: +2000, impliedProb: 0.048 },
  { team: "Dallas Cowboys", odds: +2500, impliedProb: 0.038 },
  { team: "Pittsburgh Steelers", odds: +3000, impliedProb: 0.032 },
  { team: "Minnesota Vikings", odds: +3000, impliedProb: 0.032 },
  { team: "Miami Dolphins", odds: +3500, impliedProb: 0.028 },
  { team: "Los Angeles Chargers", odds: +4000, impliedProb: 0.024 },
  { team: "Washington Commanders", odds: +4500, impliedProb: 0.022 },
  { team: "Los Angeles Rams", odds: +5000, impliedProb: 0.020 },
  { team: "Chicago Bears", odds: +5000, impliedProb: 0.020 },
  { team: "Seattle Seahawks", odds: +5500, impliedProb: 0.018 },
  { team: "Tampa Bay Buccaneers", odds: +6000, impliedProb: 0.016 },
  { team: "Denver Broncos", odds: +6000, impliedProb: 0.016 },
  { team: "Atlanta Falcons", odds: +6500, impliedProb: 0.015 },
  { team: "Jacksonville Jaguars", odds: +7000, impliedProb: 0.014 },
  { team: "New York Jets", odds: +7500, impliedProb: 0.013 },
  { team: "Indianapolis Colts", odds: +8000, impliedProb: 0.012 },
  { team: "Arizona Cardinals", odds: +8000, impliedProb: 0.012 },
  { team: "New Orleans Saints", odds: +10000, impliedProb: 0.010 },
  { team: "Las Vegas Raiders", odds: +10000, impliedProb: 0.010 },
  { team: "New England Patriots", odds: +12000, impliedProb: 0.008 },
  { team: "Cleveland Browns", odds: +12000, impliedProb: 0.008 },
  { team: "Tennessee Titans", odds: +15000, impliedProb: 0.007 },
  { team: "New York Giants", odds: +15000, impliedProb: 0.007 },
  { team: "Carolina Panthers", odds: +20000, impliedProb: 0.005 },
];

function americanToImplied(odds: number): number {
  if (odds < 0) return -odds / (-odds + 100);
  return 100 / (odds + 100);
}

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
  for (const [team, oddsArr] of teamOddsMap) {
    const avgOdds = oddsArr.reduce((a, b) => a + b, 0) / oddsArr.length;
    teams.push({
      team,
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
