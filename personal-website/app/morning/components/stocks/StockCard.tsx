import { finnhubQuoteUrl, finnhubCandleUrl } from "../../../lib/constants";
import type { StockRange } from "../../../lib/constants";
import type { StockQuote, StockCandle, StockFundamentals } from "../../../lib/types";
import StockCardDisplay from "./StockCardDisplay";

function mockCandle(basePrice: number, points: number): StockCandle {
  const prices: number[] = [];
  let price = basePrice * (0.85 + Math.random() * 0.15);
  for (let i = 0; i < points; i++) {
    price += (Math.random() - 0.48) * basePrice * 0.03;
    price = Math.max(price, basePrice * 0.7);
    prices.push(price);
  }
  const now = Math.floor(Date.now() / 1000);
  const interval = Math.floor((30 * 86400) / points);
  return {
    c: prices,
    h: prices.map((p) => p * 1.02),
    l: prices.map((p) => p * 0.98),
    o: prices.map((p) => p * (0.99 + Math.random() * 0.02)),
    t: prices.map((_, i) => now - (points - i) * interval),
    v: prices.map(() => Math.floor(Math.random() * 5000000)),
    s: "ok",
  };
}

const MOCK_DATA: Record<string, { price: number; fundamentals: StockFundamentals }> = {
  RKLB: { price: 28.5, fundamentals: { marketCap: 13400, revenueTTM: 436, revenueLastQ: 125, nextEarningsDate: "2026-05-13" } },
  ASTS: { price: 22.3, fundamentals: { marketCap: 7200, revenueTTM: 2, revenueLastQ: 0.5, nextEarningsDate: "2026-05-08" } },
  NBIS: { price: 42.1, fundamentals: { marketCap: 8500, revenueTTM: 310, revenueLastQ: 92, nextEarningsDate: "2026-05-06" } },
  KRKNF: { price: 12.8, fundamentals: { marketCap: 2100, revenueTTM: 1800, revenueLastQ: 480, nextEarningsDate: "2026-05-15" } },
  RIVN: { price: 14.6, fundamentals: { marketCap: 15200, revenueTTM: 4800, revenueLastQ: 1300, nextEarningsDate: "2026-05-07" } },
  AUR: { price: 7.2, fundamentals: { marketCap: 5800, revenueTTM: 0, revenueLastQ: 0, nextEarningsDate: "2026-05-12" } },
};

const RANGES: StockRange[] = ["1D", "1M", "1Y"];
const MOCK_POINTS: Record<StockRange, number> = { "1D": 78, "1M": 30, "1Y": 52 };

interface StockCardProps {
  symbol: string;
}

export default async function StockCard({ symbol }: StockCardProps) {
  let quote: StockQuote | null = null;
  let fundamentals: StockFundamentals | null = null;
  const candles: Record<string, StockCandle | null> = { "1D": null, "1M": null, "1Y": null };

  if (process.env.FINNHUB_API_KEY) {
    try {
      const [quoteRes, metricsRes, earningsRes, ...candleResults] = await Promise.all([
        fetch(finnhubQuoteUrl(symbol), { next: { revalidate: 300 } }),
        fetch(`https://finnhub.io/api/v1/stock/metric?symbol=${symbol}&metric=all&token=${process.env.FINNHUB_API_KEY}`, { next: { revalidate: 3600 } }),
        fetch(`https://finnhub.io/api/v1/calendar/earnings?symbol=${symbol}&token=${process.env.FINNHUB_API_KEY}`, { next: { revalidate: 3600 } }),
        ...RANGES.map((r) =>
          fetch(finnhubCandleUrl(symbol, r), { next: { revalidate: 300 } })
        ),
      ]);

      if (quoteRes.ok) {
        const q = await quoteRes.json();
        if (q.c && q.c > 0) quote = q;
      }

      if (metricsRes.ok && earningsRes.ok) {
        const m = await metricsRes.json();
        const e = await earningsRes.json();
        const metric = m.metric ?? {};
        const nextEarning = e.earningsCalendar?.[0];
        fundamentals = {
          marketCap: metric.marketCapitalization ?? 0,
          revenueTTM: metric.revenuePerShareTTM ? metric.revenuePerShareTTM * (metric.shareOutstanding ?? 0) : 0,
          revenueLastQ: metric.quarterlyRevenueGrowthYOY ?? 0,
          nextEarningsDate: nextEarning?.date ?? "TBD",
        };
      }

      for (let i = 0; i < RANGES.length; i++) {
        if (candleResults[i].ok) {
          const c = await candleResults[i].json();
          if (c.s === "ok") candles[RANGES[i]] = c;
        }
      }
    } catch {
      // Fall through to mock data
    }
  }

  // Mock fallbacks
  const mock = MOCK_DATA[symbol] ?? { price: 10, fundamentals: { marketCap: 0, revenueTTM: 0, revenueLastQ: 0, nextEarningsDate: "TBD" } };

  if (!quote) {
    const base = mock.price;
    const change = (Math.random() - 0.45) * base * 0.05;
    quote = {
      c: base,
      d: change,
      dp: (change / base) * 100,
      h: base * 1.02,
      l: base * 0.98,
      o: base - change * 0.5,
      pc: base - change,
    };
  }

  if (!fundamentals) {
    fundamentals = mock.fundamentals;
  }

  for (const r of RANGES) {
    if (!candles[r]) {
      candles[r] = mockCandle(quote.c, MOCK_POINTS[r]);
    }
  }

  return (
    <StockCardDisplay
      symbol={symbol}
      quote={quote}
      fundamentals={fundamentals}
      candles={candles as Record<string, StockCandle>}
    />
  );
}
