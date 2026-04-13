export const STOCK_SYMBOLS = ["RKLB", "ASTS", "NBIS", "KRKNF", "RIVN", "AUR"] as const;

export const AMSTERDAM = { lat: 52.3676, lon: 4.9041 };

export const NFL_DRAFT_DATE = new Date("2026-04-23T20:00:00-04:00");   // 8pm ET
export const NFL_SEASON_DATE = new Date("2026-09-10T20:20:00-04:00");  // Kickoff ~8:20pm ET

export const WEATHER_URL = `https://api.open-meteo.com/v1/forecast?latitude=${AMSTERDAM.lat}&longitude=${AMSTERDAM.lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&hourly=temperature_2m,weather_code&daily=sunrise,sunset&timezone=Europe/Amsterdam&forecast_days=1`;

export const LAUNCHES_URL = "https://ll.thespacedevs.com/2.0.0/launch/upcoming/?limit=6&mode=list";

export function finnhubQuoteUrl(symbol: string) {
  return `https://finnhub.io/api/v1/stock/quote?symbol=${symbol}&token=${process.env.FINNHUB_API_KEY}`;
}

export type StockRange = "1D" | "1M" | "1Y";

const RANGE_CONFIG: Record<StockRange, { resolution: string; seconds: number }> = {
  "1D": { resolution: "5", seconds: 1 * 24 * 60 * 60 },
  "1M": { resolution: "D", seconds: 30 * 24 * 60 * 60 },
  "1Y": { resolution: "W", seconds: 365 * 24 * 60 * 60 },
};

export function finnhubCandleUrl(symbol: string, range: StockRange = "1M") {
  const { resolution, seconds } = RANGE_CONFIG[range];
  const now = Math.floor(Date.now() / 1000);
  const from = now - seconds;
  return `https://finnhub.io/api/v1/stock/candle?symbol=${symbol}&resolution=${resolution}&from=${from}&to=${now}&token=${process.env.FINNHUB_API_KEY}`;
}

export function oddsUrl() {
  return `https://api.the-odds-api.com/v4/sports/americanfootball_nfl_super_bowl_winner/odds/?regions=us&markets=outrights&oddsFormat=american&apiKey=${process.env.ODDS_API_KEY}`;
}

// NFL team name → ESPN logo URL
const ESPN_LOGO = (abbr: string) =>
  `https://a.espncdn.com/i/teamlogos/nfl/500/${abbr}.png`;

export const NFL_TEAM_LOGOS: Record<string, string> = {
  "Arizona Cardinals": ESPN_LOGO("ari"),
  "Atlanta Falcons": ESPN_LOGO("atl"),
  "Baltimore Ravens": ESPN_LOGO("bal"),
  "Buffalo Bills": ESPN_LOGO("buf"),
  "Carolina Panthers": ESPN_LOGO("car"),
  "Chicago Bears": ESPN_LOGO("chi"),
  "Cincinnati Bengals": ESPN_LOGO("cin"),
  "Cleveland Browns": ESPN_LOGO("cle"),
  "Dallas Cowboys": ESPN_LOGO("dal"),
  "Denver Broncos": ESPN_LOGO("den"),
  "Detroit Lions": ESPN_LOGO("det"),
  "Green Bay Packers": ESPN_LOGO("gb"),
  "Houston Texans": ESPN_LOGO("hou"),
  "Indianapolis Colts": ESPN_LOGO("ind"),
  "Jacksonville Jaguars": ESPN_LOGO("jax"),
  "Kansas City Chiefs": ESPN_LOGO("kc"),
  "Las Vegas Raiders": ESPN_LOGO("lv"),
  "Los Angeles Chargers": ESPN_LOGO("lac"),
  "Los Angeles Rams": ESPN_LOGO("lar"),
  "Miami Dolphins": ESPN_LOGO("mia"),
  "Minnesota Vikings": ESPN_LOGO("min"),
  "New England Patriots": ESPN_LOGO("ne"),
  "New Orleans Saints": ESPN_LOGO("no"),
  "New York Giants": ESPN_LOGO("nyg"),
  "New York Jets": ESPN_LOGO("nyj"),
  "Philadelphia Eagles": ESPN_LOGO("phi"),
  "Pittsburgh Steelers": ESPN_LOGO("pit"),
  "San Francisco 49ers": ESPN_LOGO("sf"),
  "Seattle Seahawks": ESPN_LOGO("sea"),
  "Tampa Bay Buccaneers": ESPN_LOGO("tb"),
  "Tennessee Titans": ESPN_LOGO("ten"),
  "Washington Commanders": ESPN_LOGO("wsh"),
};

export const NFL_SHIELD_URL = "https://a.espncdn.com/i/teamlogos/leagues/500/nfl.png";

// Map WMO weather codes to descriptions + emoji
export function weatherCodeToDisplay(code: number): { description: string; icon: string } {
  if (code === 0) return { description: "Clear sky", icon: "☀️" };
  if (code <= 3) return { description: "Partly cloudy", icon: "⛅" };
  if (code <= 49) return { description: "Foggy", icon: "🌫️" };
  if (code <= 59) return { description: "Drizzle", icon: "🌦️" };
  if (code <= 69) return { description: "Rain", icon: "🌧️" };
  if (code <= 79) return { description: "Snow", icon: "❄️" };
  if (code <= 82) return { description: "Rain showers", icon: "🌧️" };
  if (code <= 86) return { description: "Snow showers", icon: "🌨️" };
  if (code <= 99) return { description: "Thunderstorm", icon: "⛈️" };
  return { description: "Unknown", icon: "🌡️" };
}
