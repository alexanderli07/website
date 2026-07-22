import { useEffect, useState } from "react";

/**
 * The field's data source — real BTC numbers only, never faked.
 *
 * Preferred: CoinGecko market_chart (24h of ~5-min closes) → realized daily
 * volatility (stdev of log returns × √n). Fallback when that endpoint is
 * rate-limited: simple/price 24h % change (labelled honestly as Δ24h, not σ).
 * Offline: the field simply rests at its base turbulence.
 */
export type PulseMode = "vol" | "chg" | "offline" | "loading";

export interface Pulse {
  /** magnitude in percent (σ daily realized vol, or |Δ24h| in fallback) */
  value: number | null;
  mode: PulseMode;
}

const CHART_URL =
  "https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=1";
const PRICE_URL =
  "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true";

const REFRESH_MS = 5 * 60 * 1000; // gentle on the free API

function realizedVolPct(prices: Array<[number, number]>): number | null {
  if (!prices || prices.length < 24) return null;
  const rets: number[] = [];
  for (let i = 1; i < prices.length; i++) {
    const a = prices[i - 1][1];
    const b = prices[i][1];
    if (a > 0 && b > 0) rets.push(Math.log(b / a));
  }
  if (rets.length < 12) return null;
  const mean = rets.reduce((s, r) => s + r, 0) / rets.length;
  const varr = rets.reduce((s, r) => s + (r - mean) * (r - mean), 0) / (rets.length - 1);
  // scale per-interval vol back up to a full-day figure
  return Math.sqrt(varr) * Math.sqrt(rets.length) * 100;
}

export function useMarketPulse(): Pulse {
  const [pulse, setPulse] = useState<Pulse>({ value: null, mode: "loading" });

  useEffect(() => {
    let alive = true;

    const load = async () => {
      // 1) realized vol from the 24h chart
      try {
        const res = await fetch(CHART_URL, { headers: { accept: "application/json" } });
        if (res.ok) {
          const data = await res.json();
          const sigma = realizedVolPct(data?.prices);
          if (sigma !== null && alive) {
            setPulse({ value: sigma, mode: "vol" });
            return;
          }
        }
      } catch {
        /* fall through to the lighter endpoint */
      }
      // 2) fallback: 24h change
      try {
        const res = await fetch(PRICE_URL, { headers: { accept: "application/json" } });
        if (res.ok) {
          const data = await res.json();
          const chg = data?.bitcoin?.usd_24h_change;
          if (typeof chg === "number" && alive) {
            setPulse({ value: Math.abs(chg), mode: "chg" });
            return;
          }
        }
      } catch {
        /* offline */
      }
      if (alive) setPulse((p) => (p.mode === "loading" ? { value: null, mode: "offline" } : p));
    };

    load();
    const t = setInterval(load, REFRESH_MS);
    return () => {
      alive = false;
      clearInterval(t);
    };
  }, []);

  return pulse;
}
