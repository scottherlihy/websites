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
  marketState: string; // "PRE" | "REGULAR" | "POST" | "CLOSED"
  preMarketPrice: number | null;
  preMarketChange: number | null;
  preMarketChangePercent: number | null;
  postMarketPrice: number | null;
  postMarketChange: number | null;
  postMarketChangePercent: number | null;
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
  net: string;
  status: { id: number; name: string };
  webcast_live: boolean;
  launch_service_provider: {
    name: string;
    logo_url: string | null;
    country_code: string;
    successful_launches: number;
    failed_launches: number;
    total_launch_count: number;
  };
  rocket: {
    configuration: {
      name: string;
      full_name: string;
      description: string;
      image_url: string | null;
      length: number | null;
      diameter: number | null;
      launch_mass: number | null;
      leo_capacity: number | null;
      to_thrust: number | null;
      successful_launches: number;
      total_launch_count: number;
    };
  };
  mission: {
    name: string;
    description: string;
    type: string;
    orbit: { name: string; abbrev: string } | null;
  } | null;
  pad: {
    name: string;
    location: { name: string };
  };
  image: string | null;
  vidURLs: Array<{ url: string; title: string }>;
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
  sunrise: string;
  sunset: string;
  hourly: HourlyWeather[];
  daily: DailyWeather[];
}

export interface HourlyWeather {
  time: string;
  temperature: number;
  weatherCode: number;
  uvIndex: number;
}

export interface DailyWeather {
  date: string;
  high: number;
  low: number;
  weatherCode: number;
  uvIndexMax: number;
}
