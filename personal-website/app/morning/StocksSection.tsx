import { Suspense } from "react";
import { STOCK_SYMBOLS, yahooChartUrl, yahooSummaryUrl } from "../lib/constants";
import type { StockRange } from "../lib/constants";
import type { StockQuote, StockCandle, StockFundamentals } from "../lib/types";
import StockToggleTw from "./StockToggleTw";

const RANGES: StockRange[] = ["1D", "1M", "1Y"];
const UA = { "User-Agent": "Mozilla/5.0" };

let cachedCrumb: { crumb: string; cookie: string; expires: number } | null = null;

async function getYahooCrumb() {
  if (cachedCrumb && Date.now() < cachedCrumb.expires) return cachedCrumb;
  try {
    const initRes = await fetch("https://fc.yahoo.com", { headers: UA, redirect: "manual" });
    const cookies = initRes.headers.getSetCookie?.() ?? [];
    const cookie = cookies.map((c) => c.split(";")[0]).join("; ");
    const crumbRes = await fetch("https://query2.finance.yahoo.com/v1/test/getcrumb", { headers: { ...UA, Cookie: cookie } });
    if (!crumbRes.ok) return null;
    const crumb = await crumbRes.text();
    cachedCrumb = { crumb, cookie, expires: Date.now() + 10 * 60 * 1000 };
    return cachedCrumb;
  } catch { return null; }
}

async function fetchChart(symbol: string, range: StockRange): Promise<StockCandle | null> {
  try {
    const res = await fetch(yahooChartUrl(symbol, range), { next: { revalidate: 300 }, headers: UA });
    if (!res.ok) return null;
    const data = await res.json();
    const result = data.chart?.result?.[0];
    if (!result) return null;
    const q = result.indicators?.quote?.[0];
    const ts = result.timestamp;
    if (!q || !ts) return null;
    const c: number[] = [], h: number[] = [], l: number[] = [], o: number[] = [], t: number[] = [], v: number[] = [];
    for (let i = 0; i < ts.length; i++) {
      if (q.close[i] != null) {
        c.push(q.close[i]); h.push(q.high?.[i] ?? q.close[i]); l.push(q.low?.[i] ?? q.close[i]);
        o.push(q.open?.[i] ?? q.close[i]); t.push(ts[i]); v.push(q.volume?.[i] ?? 0);
      }
    }
    if (c.length < 2) return null;
    return { c, h, l, o, t, v, s: "ok" };
  } catch { return null; }
}

async function fetchFundamentals(symbol: string, auth: { crumb: string; cookie: string }) {
  try {
    const res = await fetch(yahooSummaryUrl(symbol, auth.crumb), { next: { revalidate: 300 }, headers: { ...UA, Cookie: auth.cookie } });
    if (!res.ok) return null;
    const data = await res.json();
    const r = data.quoteSummary?.result?.[0];
    if (!r) return null;
    const price = r.price ?? {};
    const fd = r.financialData ?? {};
    const ce = r.calendarEvents ?? {};
    const current = price.regularMarketPrice?.raw ?? 0;
    const prevClose = price.regularMarketPreviousClose?.raw ?? current;
    const change = price.regularMarketChange?.raw ?? current - prevClose;
    const changePct = price.regularMarketChangePercent?.raw ? price.regularMarketChangePercent.raw * 100 : prevClose ? (change / prevClose) * 100 : 0;
    return {
      quote: {
        c: current, d: change, dp: changePct,
        h: price.regularMarketDayHigh?.raw ?? current,
        l: price.regularMarketDayLow?.raw ?? current,
        o: price.regularMarketOpen?.raw ?? current,
        pc: prevClose,
        marketState: price.marketState ?? "CLOSED",
        preMarketPrice: price.preMarketPrice?.raw ?? null,
        preMarketChange: price.preMarketChange?.raw ?? null,
        preMarketChangePercent: price.preMarketChangePercent?.raw ? price.preMarketChangePercent.raw * 100 : null,
        postMarketPrice: price.postMarketPrice?.raw ?? null,
        postMarketChange: price.postMarketChange?.raw ?? null,
        postMarketChangePercent: price.postMarketChangePercent?.raw ? price.postMarketChangePercent.raw * 100 : null,
      } as StockQuote,
      fundamentals: { marketCap: (price.marketCap?.raw ?? 0) / 1e6, revenueTTM: (fd.totalRevenue?.raw ?? 0) / 1e6, revenueLastQ: fd.revenueGrowth?.raw ?? 0, nextEarningsDate: ce.earnings?.earningsDate?.[0]?.fmt ?? "TBD" } as StockFundamentals,
    };
  } catch { return null; }
}

async function StockCard({ symbol }: { symbol: string }) {
  const auth = await getYahooCrumb();
  const [fund, ...charts] = await Promise.all([
    auth ? fetchFundamentals(symbol, auth) : Promise.resolve(null),
    ...RANGES.map((r) => fetchChart(symbol, r)),
  ]);

  if (!fund?.quote) {
    return (
      <div className="bg-[#1a2333] rounded-lg p-3 flex flex-col gap-2">
        <span className="text-sm font-bold text-[#d0d7e2] tracking-wide">{symbol}</span>
        <p className="text-xs text-[#3f4c5e] text-center py-4">Couldn&apos;t load stock data</p>
      </div>
    );
  }

  const candles: Record<string, StockCandle | null> = {};
  RANGES.forEach((r, i) => { candles[r] = charts[i] as StockCandle | null; });

  return (
    <StockCardTw
      symbol={symbol}
      quote={fund.quote}
      fundamentals={fund.fundamentals}
      candles={candles}
    />
  );
}

export default function StocksSection() {
  return (
    <section className="bg-[#121826] rounded-xl p-5">
      <h2 className="text-[0.65rem] font-medium uppercase tracking-[0.12em] text-[#3f4c5e] mb-4">Stocks</h2>
      <StockToggleTw>
        <div className="grid grid-cols-3 gap-2">
          {STOCK_SYMBOLS.map((s) => (
            <Suspense key={s} fallback={<div className="bg-[#1a2333] rounded-lg p-3 h-[120px]" />}>
              <StockCard symbol={s} />
            </Suspense>
          ))}
        </div>
      </StockToggleTw>
    </section>
  );
}

// Client component for individual stock card display
import StockCardTw from "./StockCardTw";
