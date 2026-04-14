import { yahooChartUrl, yahooSummaryUrl } from "../../../lib/constants";
import type { StockRange } from "../../../lib/constants";
import type { StockQuote, StockCandle, StockFundamentals } from "../../../lib/types";
import StockCardDisplay from "./StockCardDisplay";
import styles from "./stocks.module.css";

const RANGES: StockRange[] = ["1D", "1M", "1Y"];
const UA = { "User-Agent": "Mozilla/5.0" };

// Yahoo requires a crumb + cookies for quoteSummary
let cachedCrumb: { crumb: string; cookie: string; expires: number } | null = null;

async function getYahooCrumb(): Promise<{ crumb: string; cookie: string } | null> {
  if (cachedCrumb && Date.now() < cachedCrumb.expires) {
    return cachedCrumb;
  }
  try {
    const initRes = await fetch("https://fc.yahoo.com", { headers: UA, redirect: "manual" });
    const cookies = initRes.headers.getSetCookie?.() ?? [];
    const cookie = cookies.map((c) => c.split(";")[0]).join("; ");

    const crumbRes = await fetch("https://query2.finance.yahoo.com/v1/test/getcrumb", {
      headers: { ...UA, Cookie: cookie },
    });
    if (!crumbRes.ok) return null;
    const crumb = await crumbRes.text();

    cachedCrumb = { crumb, cookie, expires: Date.now() + 10 * 60 * 1000 }; // 10 min
    return cachedCrumb;
  } catch {
    return null;
  }
}

async function fetchYahooChart(symbol: string, range: StockRange): Promise<StockCandle | null> {
  try {
    const res = await fetch(yahooChartUrl(symbol, range), {
      next: { revalidate: 300 },
      headers: UA,
    });
    if (!res.ok) return null;
    const data = await res.json();
    const result = data.chart?.result?.[0];
    if (!result) return null;

    const quote = result.indicators?.quote?.[0];
    const timestamps = result.timestamp;
    if (!quote || !timestamps) return null;

    const closes: number[] = [];
    const highs: number[] = [];
    const lows: number[] = [];
    const opens: number[] = [];
    const times: number[] = [];
    const vols: number[] = [];

    for (let i = 0; i < timestamps.length; i++) {
      if (quote.close[i] != null) {
        closes.push(quote.close[i]);
        highs.push(quote.high?.[i] ?? quote.close[i]);
        lows.push(quote.low?.[i] ?? quote.close[i]);
        opens.push(quote.open?.[i] ?? quote.close[i]);
        times.push(timestamps[i]);
        vols.push(quote.volume?.[i] ?? 0);
      }
    }

    if (closes.length < 2) return null;
    return { c: closes, h: highs, l: lows, o: opens, t: times, v: vols, s: "ok" };
  } catch {
    return null;
  }
}

async function fetchYahooFundamentals(
  symbol: string,
  auth: { crumb: string; cookie: string }
): Promise<{ quote: StockQuote; fundamentals: StockFundamentals } | null> {
  try {
    const res = await fetch(yahooSummaryUrl(symbol, auth.crumb), {
      next: { revalidate: 300 },
      headers: { ...UA, Cookie: auth.cookie },
    });
    if (!res.ok) return null;
    const data = await res.json();
    const result = data.quoteSummary?.result?.[0];
    if (!result) return null;

    const price = result.price ?? {};
    const fd = result.financialData ?? {};
    const ce = result.calendarEvents ?? {};

    const current = price.regularMarketPrice?.raw ?? 0;
    const prevClose = price.regularMarketPreviousClose?.raw ?? current;
    const change = price.regularMarketChange?.raw ?? current - prevClose;
    const changePct = price.regularMarketChangePercent?.raw
      ? price.regularMarketChangePercent.raw * 100
      : prevClose ? ((change / prevClose) * 100) : 0;

    const quote: StockQuote = {
      c: current,
      d: change,
      dp: changePct,
      h: price.regularMarketDayHigh?.raw ?? current,
      l: price.regularMarketDayLow?.raw ?? current,
      o: price.regularMarketOpen?.raw ?? current,
      pc: prevClose,
    };

    const marketCap = price.marketCap?.raw ?? 0;
    const totalRevenue = fd.totalRevenue?.raw ?? 0;
    const revenueGrowth = fd.revenueGrowth?.raw ?? 0;
    const earningsDates = ce.earnings?.earningsDate ?? [];
    const nextEarnings = earningsDates[0]?.fmt ?? "TBD";

    const fundamentals: StockFundamentals = {
      marketCap: marketCap / 1e6, // convert to millions
      revenueTTM: totalRevenue / 1e6,
      revenueLastQ: revenueGrowth, // store growth % for now
      nextEarningsDate: nextEarnings,
    };

    return { quote, fundamentals };
  } catch {
    return null;
  }
}

interface StockCardProps {
  symbol: string;
}

export default async function StockCard({ symbol }: StockCardProps) {
  const auth = await getYahooCrumb();

  // Fetch fundamentals + all chart ranges in parallel
  const [fundResult, ...chartResults] = await Promise.all([
    auth ? fetchYahooFundamentals(symbol, auth) : Promise.resolve(null),
    ...RANGES.map((r) => fetchYahooChart(symbol, r)),
  ]);

  if (!fundResult?.quote) {
    return (
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <span className={styles.symbol}>{symbol}</span>
        </div>
        <p className={styles.unavailable}>Couldn&apos;t load stock data</p>
      </div>
    );
  }

  const candles: Record<string, StockCandle> = {};
  for (let i = 0; i < RANGES.length; i++) {
    const c = chartResults[i];
    if (c) candles[RANGES[i]] = c;
  }

  return (
    <StockCardDisplay
      symbol={symbol}
      quote={fundResult.quote}
      fundamentals={fundResult.fundamentals}
      candles={candles}
    />
  );
}
