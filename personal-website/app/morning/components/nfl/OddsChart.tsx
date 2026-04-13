"use client";

import Image from "next/image";
import { NFL_TEAM_LOGOS } from "../../../lib/constants";
import type { TeamOdds } from "../../../lib/types";
import styles from "./nfl.module.css";

interface OddsChartProps {
  teams: TeamOdds[];
}

function formatOdds(odds: number): string {
  return odds > 0 ? `+${odds}` : `${odds}`;
}

export default function OddsChart({ teams }: OddsChartProps) {
  const maxProb = teams[0]?.impliedProb ?? 1;

  return (
    <div className={styles.oddsChart}>
      {teams.map((team, i) => {
        const logoUrl = NFL_TEAM_LOGOS[team.team];
        return (
          <div key={team.team} className={styles.oddsRow}>
            <span className={styles.oddsRank}>{i + 1}</span>
            {logoUrl ? (
              <Image
                src={logoUrl}
                alt={team.team}
                width={20}
                height={20}
                className={styles.oddsLogo}
              />
            ) : (
              <span className={styles.oddsLogoPlaceholder} />
            )}
            <span className={styles.oddsTeam}>{team.team}</span>
            <div className={styles.oddsBarContainer}>
              <div
                className={styles.oddsBar}
                style={{
                  width: `${(team.impliedProb / maxProb) * 100}%`,
                  opacity: 1 - i * 0.015,
                  animationDelay: `${i * 40}ms`,
                }}
              />
            </div>
            <span className={styles.oddsValue}>{formatOdds(Math.round(team.odds))}</span>
            <span className={styles.oddsProb}>
              {(team.impliedProb * 100).toFixed(1)}%
            </span>
          </div>
        );
      })}
    </div>
  );
}
