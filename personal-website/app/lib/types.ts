// Finnhub
export interface StockFundamentals {
  marketCap: number;       // in millions
  revenueTTM: number;      // in millions
  revenueLastQ: number;    // in millions
  nextEarningsDate: string;
}

export interface StockQuote {
  c: number;  // current price
  d: number;  // change
  dp: number; // percent change
  h: number;  // high
  l: number;  // low
  o: number;  // open
  pc: number; // previous close
}

export interface StockCandle {
  c: number[];  // close prices
  h: number[];  // highs
  l: number[];  // lows
  o: number[];  // opens
  t: number[];  // timestamps (unix)
  v: number[];  // volumes
  s: string;    // status ("ok" or "no_data")
}

// Space Devs Launch Library 2 (mode=detailed returns nested objects)
export interface Launch {
  id: string;
  name: string;
  net: string;        // ISO datetime
  status: { id: number; name: string };
  launch_service_provider: {
    name: string;
    logo_url: string | null;
  };
  mission: { name: string; description: string } | null;
  pad: {
    name: string;
    location: { name: string };
  };
  image: string | null;
}

export interface LaunchResponse {
  count: number;
  results: Launch[];
}

// The Odds API
export interface OddsOutcome {
  name: string;
  price: number; // American odds
}

export interface OddsBookmaker {
  key: string;
  title: string;
  last_update: string;
  markets: Array<{
    key: string;
    outcomes: OddsOutcome[];
  }>;
}

export interface OddsEvent {
  id: string;
  sport_key: string;
  sport_title: string;
  commence_time: string;
  bookmakers: OddsBookmaker[];
}

// Processed odds for display
export interface TeamOdds {
  team: string;
  odds: number;          // average American odds
  impliedProb: number;   // 0-1
}

// Open-Meteo Weather
export interface WeatherData {
  temperature: number;
  weatherCode: number;
  windSpeed: number;
  humidity: number;
  sunrise: string;    // ISO time
  sunset: string;     // ISO time
  hourly: HourlyWeather[];
}

export interface HourlyWeather {
  time: string;       // ISO time
  temperature: number;
  weatherCode: number;
}
